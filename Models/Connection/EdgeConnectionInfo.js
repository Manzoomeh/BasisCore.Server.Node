import net from "net";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import IEdgeSettingData from "./IEdgeSettingData.js";
import EdgeMessage from "../../edge/edgeMessage.js";
import WebServerException from "../Exceptions/WebServerException.js";
import {
  traceRequest,
  traceError,
  getRequestTraceId,
} from "../../modules/requestTrace.js";

const DEFAULT_EDGE_SOCKET_TIMEOUT_MS = 15000;

function resolveEdgeSocketTimeoutMs() {
  const raw = Number(process.env.EDGE_SOCKET_TIMEOUT_MS || "");
  if (Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  return DEFAULT_EDGE_SOCKET_TIMEOUT_MS;
}
/**
 * @typedef {Object} LoadDataRequest
 * @property {string} dmnid --domainID
 * @property {string} command --the basis core command
 * @property {NodeJS.Dict<string>} params -- other parameters
 */
export default class EdgeConnectionInfo extends ConnectionInfo {
  /** @type {IEdgeSettingData} */
  settings;
  /** @type {string} */
  #ip;
  /** @type {number} */
  #port;

  /**
   * @param {string} name
   * @param {IEdgeSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    this.settings = settings;
    const parts = this.settings.endpoint.split(":");
    this.#ip = parts[0];
    this.#port = parseInt(parts[1]);
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    try {
      /**
       * @type LoadDataRequest
       */
      const loadDataRequest = {
        dmnid: parameters.dmnid,
        command: parameters.command,
        params: parameters.params ?? {},
      };
      const response = await this.sendAsync(loadDataRequest);
      return this.convertJSONToDataSet(response);
    } catch (error) {
      throw new WebServerException(error + "  " + this.settings.endpoint);
    }
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IRoutingRequest>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    const result = await this.sendAsync(request);
    const cmsPart = result?.cms || {};
    const topWebserver =
      result?.webserver && typeof result.webserver === "object"
        ? result.webserver
        : {};
    const cmsWebserver =
      cmsPart?.webserver && typeof cmsPart.webserver === "object"
        ? cmsPart.webserver
        : {};
    if (Object.keys(topWebserver).length > 0 || Object.keys(cmsWebserver).length > 0) {
      // Prefer top-level values when present, but backfill from cms.webserver.
      result.webserver = {
        ...cmsWebserver,
        ...topWebserver,
      };
      // Ensure critical file fields are not lost if top-level shape is partial.
      if (!result.webserver.filepath && cmsWebserver.filepath) {
        result.webserver.filepath = cmsWebserver.filepath;
      }
      if (!result.webserver.zippath && cmsWebserver.zippath) {
        result.webserver.zippath = cmsWebserver.zippath;
      }
      if (!result.webserver.webppath && cmsWebserver.webppath) {
        result.webserver.webppath = cmsWebserver.webppath;
      }
      delete cmsPart.webserver;
    }

    const topHttp =
      result?.http && typeof result.http === "object" ? result.http : {};
    const cmsHttp =
      cmsPart?.http && typeof cmsPart.http === "object" ? cmsPart.http : {};
    if (Object.keys(topHttp).length > 0 || Object.keys(cmsHttp).length > 0) {
      result.http = {
        ...cmsHttp,
        ...topHttp,
      };
      delete cmsPart.http;
    }
    return result;
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<RoutingRequest>}
   */
  async processAsync(request, fileContents) {
    await this._processUploadAsync(fileContents, request);
    /** @type {Promise<Request>} */
    const result = await this.sendAsync(request);
    return this._createResponse(result);
  }

  /**
   * @param {string} pageName
   * @param {string} rawCommand
   * @param {number} pageSize
   * @param {number} domainId
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<import("./ILoadPageResult.js").default>}
   */
  async loadPageAsync(pageName, rawCommand, pageSize, domainId, cancellationToken) {
    const startedAt = Date.now();
    const source = String(this.settings?.source || "sbcallprocedure").trim();
    const name = String(this.settings?.name || "v3").trim();
    const commandXml = `<dbsource source="${source}" name="${name}"><member name="rows" type="list" request="rows"/></dbsource>`;
    const params = {
      fileNames: pageName,
      sitesize: pageSize,
      basisCommand: rawCommand,
    };
    const owneridRaw = Number(this.settings?.ownerid);
    if (Number.isFinite(owneridRaw) && owneridRaw > 0) {
      params.ownerid = owneridRaw;
    }
    const payload = {
      dmnid: domainId,
      command: commandXml,
      params,
    };
    const response = await this.sendAsync(payload);
    if (response?.errorMessage) {
      throw new WebServerException(String(response.errorMessage));
    }
    const rows = this._extractCallCommandRows(response);
    const durationMs = Date.now() - startedAt;
    const baseLogPayload = {
      connection: this.name,
      endpoint: this.settings?.endpoint || "",
      source,
      action: name,
      pageName,
      dmnid: domainId,
      siteSize: pageSize,
      commandLength: String(rawCommand || "").length,
      rowCount: rows.length,
      durationMs,
    };

    if (rows.length > 0) {
      const firstRow = rows[0] || {};
      const ilCallRaw =
        firstRow.il_call ?? firstRow.IL_CALL ?? firstRow.ilCall ?? null;
      const pageIl =
        firstRow.page_il ?? firstRow.PAGE_IL ?? firstRow.pageIl ?? "";
      const content = firstRow.content ?? firstRow.CONTENT ?? "";
      const enrichedPayload = {
        ...baseLogPayload,
        ilCall: ilCallRaw,
        pageIlLength: String(pageIl || "").length,
        hasPageIl: String(pageIl || "").trim().length > 0,
        contentLength: String(content || "").length,
      };
      console.log(`[callcommand-load] ${JSON.stringify(enrichedPayload)}`);
      traceRequest("callcommand.load_page", enrichedPayload);
    } else {
      console.warn(
        `[callcommand-load] ${JSON.stringify({
          ...baseLogPayload,
          warn: "empty-recordset",
        })}`
      );
      traceRequest("callcommand.load_page", {
        ...baseLogPayload,
        warn: "empty-recordset",
      });
    }

    if (rows.length !== 1) {
      throw new WebServerException(
        `Call Command Expect 1 File '${pageName}' But Get ${rows.length} File(s) From '${source}/${name}' Edge Action`
      );
    }
    return rows[0];
  }

  /**
   * @param {any} response
   * @returns {Array<Record<string, any>>}
   */
  _extractCallCommandRows(response) {
    const directRows = this._pickRowsFromAny(response);
    if (directRows.length > 0) {
      return directRows;
    }

    if (response?.sources && Array.isArray(response.sources)) {
      for (const source of response.sources) {
        const rows = this._pickRowsFromAny(source?.data);
        if (rows.length > 0) {
          return rows;
        }
      }
    }

    if (response && typeof response === "object") {
      for (const key of Object.keys(response)) {
        const rows = this._pickRowsFromAny(response[key]);
        if (rows.length > 0) {
          return rows;
        }
      }
    }

    return [];
  }

  /**
   * @param {any} value
   * @returns {Array<Record<string, any>>}
   */
  _pickRowsFromAny(value) {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.filter((item) => item && typeof item === "object");
    }
    if (value && typeof value === "object") {
      if (Array.isArray(value.rows)) {
        return value.rows.filter((item) => item && typeof item === "object");
      }
      if (Array.isArray(value.data)) {
        return value.data.filter((item) => item && typeof item === "object");
      }
    }
    return [];
  }
  /**@returns {Promise<boolean>} */
  async testConnectionAsync() {
    return new Promise((resolve) => {
      const client = new net.Socket();
      client.on("error", (e) => {
        resolve(false);
      });
      client.connect(this.#port, this.#ip, () => {
        client.end();
        resolve(true);
      });
    });
  }
  /**
   *
   * @param {Request|LoadDataRequest} request
   * @returns {Promise<NodeJS.Dict<string>>}
   */
  sendAsync(request) {
    return new Promise((resolve, reject) => {
      let isSettled = false;
      const chunks = [];
      let totalBytes = 0;
      const timeoutMs = resolveEdgeSocketTimeoutMs();
      const endpoint = this.settings.endpoint;
      const traceId = getRequestTraceId(request);
      const startedAt = Date.now();
      traceRequest("edge.send.start", {
        traceId,
        endpoint,
        timeoutMs,
        isCommand: !!request?.command,
        connection: this.name,
        command: request?.command || "",
        dmnid: request?.dmnid ?? "",
        paramsKeys:
          request?.params && typeof request.params === "object"
            ? Object.keys(request.params)
            : [],
        url: request?.request?.["full-url"] || "",
      });
      const safeResolve = (value) => {
        if (isSettled) return;
        isSettled = true;
        traceRequest("edge.send.done", {
          traceId,
          endpoint,
          elapsedMs: Date.now() - startedAt,
          responseKeys:
            value && typeof value === "object" ? Object.keys(value) : [],
        });
        resolve(value);
      };
      const safeReject = (error) => {
        if (isSettled) return;
        isSettled = true;
        traceError("edge.send.error", error, {
          traceId,
          endpoint,
          elapsedMs: Date.now() - startedAt,
        });
        reject(error);
      };
      const client = new net.Socket()
        .on("data", (data) => {
          chunks.push(data);
          totalBytes += data.length;
          traceRequest("edge.send.chunk", {
            traceId,
            endpoint,
            chunkBytes: data.length,
            totalBytes,
          });
        })
        .on("timeout", () => {
          const timeoutError = new Error(
            `Edge socket timeout after ${timeoutMs}ms (${endpoint})`
          );
          client.destroy(timeoutError);
          safeReject(timeoutError);
        })
        .on("close", () => {
          const data = Buffer.concat(chunks);
          traceRequest("edge.send.close", {
            traceId,
            endpoint,
            totalBytes: data.length,
          });
          if (data.length === 0) {
            safeReject(
              new Error(
                "Empty response from edge endpoint. " +
                  "Target is unreachable or not speaking edge protocol."
              )
            );
            return;
          }
          try {
            const msg = EdgeMessage.createFromBuffer(data);
            safeResolve(JSON.parse(msg.payload));
          } catch (e) {
            safeReject(e);
          }
        })
        .on("error", (e) => {
          traceError("edge.socket.error", e, { traceId, endpoint });
          safeReject(e);
        })
        .connect(this.#port, this.#ip, () => {
          client.setTimeout(timeoutMs);
          traceRequest("edge.socket.connected", {
            traceId,
            endpoint,
            localAddress: client.localAddress || "",
            localPort: client.localPort || "",
            remoteAddress: client.remoteAddress || "",
            remotePort: client.remotePort || "",
          });
          let msg;
          if (request?.command) {
            msg = EdgeMessage.createAdHocMessageFromObject(request);
          } else {
            msg = EdgeMessage.createAdHocMessageFromObject({
              cms: request,
            });
          }
          traceRequest("edge.socket.write", {
            traceId,
            endpoint,
            payloadBytes: msg?.payload?.length || 0,
          });
          msg.writeTo(client);
        });
    });
  }
  /**
   *
   * @param {string} jsonString
   * @returns {DataSourceCollection}
   */
  convertJSONToDataSet(content) {
    if (content?.sources && Array.isArray(content?.sources)) {
      let retVal = [];
      content.sources.forEach((source) => {
        retVal.push(source.data);
      });
      return new DataSourceCollection(retVal);
    } else {
      throw new WebServerException(
        "Error from " +
          this.name +
          " Connection ;the sources are not available."
      );
    }
  }
}
