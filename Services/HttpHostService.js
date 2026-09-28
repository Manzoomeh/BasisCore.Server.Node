import HostService from "./hostService.js";
import WebServerException from "../Models/Exceptions/WebServerException.js";
import Request from "../Models/request.js";
import Response from "../Models/Response.js";
import {
  traceRequest,
  traceError,
  getRequestTraceId,
} from "../modules/requestTrace.js";

function toCleanString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function parseSaveHtmlPayload(rawSaveHtml) {
  if (!rawSaveHtml) {
    return null;
  }
  if (typeof rawSaveHtml === "object") {
    return rawSaveHtml;
  }
  if (typeof rawSaveHtml !== "string") {
    return null;
  }
  const rawText = toCleanString(rawSaveHtml);
  if (!rawText) {
    return null;
  }
  try {
    return JSON.parse(rawText);
  } catch (_) {
    return null;
  }
}

function readSaveHtmlFromRoutingData(data) {
  const fromWebserver = data?.webserver?.savehtml;
  if (
    fromWebserver != null &&
    !(typeof fromWebserver === "string" && !toCleanString(fromWebserver))
  ) {
    return {
      source: "webserver",
      rawSaveHtml: fromWebserver,
    };
  }

  const fromCmsWebserver = data?.cms?.webserver?.savehtml;
  if (
    fromCmsWebserver != null &&
    !(typeof fromCmsWebserver === "string" && !toCleanString(fromCmsWebserver))
  ) {
    return {
      source: "cms.webserver",
      rawSaveHtml: fromCmsWebserver,
    };
  }

  return {
    source: "none",
    rawSaveHtml: null,
  };
}

function isSafeQueryKey(key) {
  return (
    key &&
    key !== "__proto__" &&
    key !== "constructor" &&
    key !== "prototype"
  );
}

function mirrorIncomingQueryToRoutingData(data, request) {
  if (!data || !request?.query || typeof request.query !== "object") {
    return;
  }
  data.query = {
    ...(data.query && typeof data.query === "object" ? data.query : {}),
  };
  data.request = {
    ...(data.request && typeof data.request === "object" ? data.request : {}),
  };
  for (const [key, value] of Object.entries(request.query)) {
    if (!isSafeQueryKey(key)) {
      continue;
    }
    data.query[key] = value;
    data.request[key] = value;
  }

  const incomingRkey = request.query.rkey || request.query.rKey;
  if (incomingRkey) {
    data.webserver = {
      ...(data.webserver && typeof data.webserver === "object"
        ? data.webserver
        : {}),
    };
    data.webserver.cookie = {
      ...(data.webserver.cookie && typeof data.webserver.cookie === "object"
        ? data.webserver.cookie
        : {}),
      rkey: incomingRkey,
      rKey: incomingRkey,
    };
    const cookieHeader = String(data.request.cookie || "").trim();
    data.request.cookie = cookieHeader
      ? `${cookieHeader}; rkey=${encodeURIComponent(incomingRkey)}`
      : `rkey=${encodeURIComponent(incomingRkey)}`;
  }
}

export class HttpHostService extends HostService {
  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   */
  constructor(name, options) {
    super(name, options);
    if (!this.settings.routerConnection) {
      throw new WebServerException(
        `Router connection not set in '${name}' http base host service!`
      );
    }
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async processAsync(request, fileContents) {
    try {
      const traceId = getRequestTraceId(request);
      traceRequest("service.http.start", {
        traceId,
        service: this.name,
        url: request?.FullUrl || request?.Url || "",
        routerConnection: this.settings?.routerConnection?.name || "",
      });
      await this._processUploadAsync(fileContents, request);
      traceRequest("service.http.routing.call", {
        traceId,
        service: this.name,
        connection: this.settings?.routerConnection?.name || "",
      });
      const data = await this.settings.routerConnection.getRoutingDataAsync(
        request,
        null
      );
      mirrorIncomingQueryToRoutingData(data, request);
      // RoutingData may only return its known top-level fields. Preserve the
      // locally generated legacy source so RequestContext can resolve
      // cms.json.header while rendering the page.
      if (
        (!data.json || typeof data.json !== "object") &&
        request.json &&
        typeof request.json === "object"
      ) {
        data.json = request.json;
      }
      traceRequest("service.http.routing.query_mirrored", {
        traceId,
        service: this.name,
        queryKeys:
          data?.query && typeof data.query === "object"
            ? Object.keys(data.query)
            : [],
        requestRkey: data?.request?.rkey || data?.request?.rKey || "",
        queryRkey: data?.query?.rkey || data?.query?.rKey || "",
        cookieRkey:
          data?.webserver?.cookie?.rkey || data?.webserver?.cookie?.rKey || "",
        jsonKeys:
          data?.json && typeof data.json === "object"
            ? Object.keys(data.json)
            : [],
        jsonHeaderBytes: Buffer.byteLength(data?.json?.header || ""),
      });
      traceRequest("service.http.routing.done", {
        traceId,
        service: this.name,
        index: data?.webserver?.index || "",
        headerCode: data?.webserver?.headercode || "",
        filePath: data?.webserver?.filepath || data?.cms?.webserver?.filepath || "",
        routingFileMode:
          data?.webserver?.routingcms_file_mode ||
          data?.cms?.webserver?.routingcms_file_mode ||
          "",
        routingFileExists:
          data?.webserver?.routingcms_file_exists ||
          data?.cms?.webserver?.routingcms_file_exists ||
          "",
        routingFileRelative:
          data?.webserver?.routingcms_file_relative ||
          data?.cms?.webserver?.routingcms_file_relative ||
          "",
      });

      if (data?.webserver?.index === "1") {
        const saveHtmlData = readSaveHtmlFromRoutingData(data);
        const parsedSaveHtml = parseSaveHtmlPayload(saveHtmlData.rawSaveHtml);
        traceRequest("service.http.routing.savehtml", {
          traceId,
          service: this.name,
          source: saveHtmlData.source,
          exists: saveHtmlData.rawSaveHtml != null,
          rawType:
            saveHtmlData.rawSaveHtml == null
              ? ""
              : typeof saveHtmlData.rawSaveHtml,
          parsed: !!parsedSaveHtml,
          path: parsedSaveHtml?.path || "",
          name: parsedSaveHtml?.name || "",
          hasArchive:
            !!parsedSaveHtml?.archive &&
            typeof parsedSaveHtml.archive === "object",
          archiveMain: parsedSaveHtml?.archive?.main || "",
          archiveCompressed: parsedSaveHtml?.archive?.compressed || "",
        });
      }
      data.isSecure = request.isSecure;
      return this._createResponse(data);
    } catch (er) {
      traceError("service.http.error", er, {
        traceId: getRequestTraceId(request),
        service: this.name,
        url: request?.FullUrl || request?.Url || "",
      });
      throw er;
    }
  }
}
