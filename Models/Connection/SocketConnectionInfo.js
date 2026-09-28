import net from "net";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import SocketSettingData from "./SocketSettingData.js";
import { traceRequest, traceError } from "../../modules/requestTrace.js";

const DEFAULT_SOCKET_CONNECTION_TIMEOUT_MS = 30000;

function resolveSocketConnectionTimeoutMs() {
  const raw = Number(
    process.env.SOCKET_CONNECTION_TIMEOUT_MS ||
      process.env.EDGE_SOCKET_TIMEOUT_MS ||
      ""
  );
  if (Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  return DEFAULT_SOCKET_CONNECTION_TIMEOUT_MS;
}

function normalizeSocketCommand(command) {
  const rawCommand = String(command || "");
  if (!rawCommand || /\sprocedurename\s*=/.test(rawCommand)) {
    return rawCommand;
  }
  return rawCommand.replace(
    /<basis\b/i,
    "<basis procedurename='dbsource'"
  );
}

function createSocketPayload(parameters) {
  if (parameters?.byteMessage) {
    return parameters.byteMessage;
  }
  if (parameters?.command) {
    const command = normalizeSocketCommand(parameters.command);
    return new TextEncoder().encode(
      JSON.stringify({
        command: Buffer.from(command, "utf8").toString("base64"),
        dmnid: Buffer.from(String(parameters.dmnid || ""), "utf8").toString(
          "base64"
        ),
        params: parameters.params ?? {},
      })
    );
  }
  return null;
}

export function shouldPreserveRawSocketResponse(command) {
  const rawCommand = String(command || "");
  if (!rawCommand) {
    return false;
  }

  // Legacy postsql statements consume the service payload through a single
  // `result` column. Members without postsql need the parsed object/array so
  // nested fields (for example passenger-form.room) remain addressable.
  return /<member\b[^>]*\bpostsql\s*=/i.test(rawCommand);
}

function normalizePythonLiteralToJson(value) {
  let json = "";
  let inString = false;
  let token = "";

  const flushToken = () => {
    if (!token) {
      return;
    }
    switch (token) {
      case "None":
        json += "null";
        break;
      case "True":
        json += "true";
        break;
      case "False":
        json += "false";
        break;
      default:
        json += token;
        break;
    }
    token = "";
  };

  for (let index = 0; index < value.length; index++) {
    const char = value[index];
    if (inString) {
      if (char === "\\") {
        const next = value[++index];
        if (next === undefined) {
          json += "\\\\";
        } else if (next === "'") {
          json += "'";
        } else {
          json += `\\${next}`;
        }
      } else if (char === "'") {
        json += '"';
        inString = false;
      } else if (char === '"') {
        json += '\\"';
      } else if (char === "\n") {
        json += "\\n";
      } else if (char === "\r") {
        json += "\\r";
      } else if (char === "\t") {
        json += "\\t";
      } else {
        json += char;
      }
      continue;
    }

    if (char === "'") {
      flushToken();
      json += '"';
      inString = true;
    } else if (/[A-Za-z_]/.test(char)) {
      token += char;
    } else {
      flushToken();
      json += char;
    }
  }
  flushToken();
  return json;
}

export function parseSocketResponseDataSet(rawValue) {
  const text = String(rawValue ?? "").trim();
  if (!text || !/^[\[{]/.test(text)) {
    return null;
  }

  const parseCandidate = (candidate) => {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) {
      return new DataSourceCollection([parsed]);
    }
    if (parsed && typeof parsed === "object") {
      // Status envelopes are not tabular service results. Keep their original
      // representation in the conventional `result` column so member postsql
      // and templates can pass messages such as {'msg': 'no data'} through.
      if (Object.hasOwn(parsed, "msg") && !Object.hasOwn(parsed, "result")) {
        return null;
      }
      return new DataSourceCollection([[parsed]]);
    }
    return null;
  };

  try {
    return parseCandidate(text);
  } catch {
    // Some legacy socket services return Python repr, e.g. [{'id': 1}].
  }

  try {
    return parseCandidate(normalizePythonLiteralToJson(text));
  } catch {
    return null;
  }
}

export function createSocketResponseDataSet(
  rawValue,
  { preserveRaw = false } = {}
) {
  const text = String(rawValue ?? "");
  if (preserveRaw) {
    return new DataSourceCollection([[{ result: text }]]);
  }
  return (
    parseSocketResponseDataSet(text) ||
    new DataSourceCollection([[{ result: text }]])
  );
}

/**
 * @typedef {Object} LoadDataRequest
 * @property {string} dmnid --domainID
 * @property {string} command --the basis core command
 * @property {NodeJS.Dict<string>} params -- other parameters
 */
export default class SocketConnectionInfo extends ConnectionInfo {
  /**@type {string} */
  host;
  /**@type {string} */
  port;
  /**
   * @param {string} name
   * @param {SocketSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    [this.host, this.port] = settings.endpoint.split(":");
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    const byteMessage = createSocketPayload(parameters);
    const preserveRawResponse = shouldPreserveRawSocketResponse(
      parameters?.command
    );
    const mySocket = new net.Socket();
    const endpoint = `${this.host}:${this.port}`;
    const timeoutMs = resolveSocketConnectionTimeoutMs();
    mySocket.setTimeout(timeoutMs);
    /** @type {Buffer[]}*/
    const buffer = [];
    let settled = false;

    await new Promise((resolve, reject) => {
      mySocket.connect(
        {
          host: this.host,
          port: this.port,
        },
        () => {
          resolve();
        }
      );
      mySocket.on("error", (err) => {
        reject(err);
      });
      mySocket.on("timeout", () => {
        mySocket.destroy(
          new Error(`Socket connection timeout after ${timeoutMs}ms (${endpoint})`)
        );
      });
    });
    const networkStream = mySocket;

    let result = await new Promise((resolve, reject) => {
      const finish = (event) => {
        if (settled) {
          return;
        }
        settled = true;
        const data = Buffer.concat(buffer);
        const retVal = data.toString();
        traceRequest("socket.send.done", {
          connection: this.name,
          endpoint,
          event,
          totalBytes: data.length,
          preview: retVal.slice(0, 200),
        });
        resolve(
          createSocketResponseDataSet(retVal, {
            preserveRaw: preserveRawResponse,
          })
        );
      };

      networkStream.on("data", (data) => {
        buffer.push(data);
        traceRequest("socket.send.chunk", {
          connection: this.name,
          endpoint,
          chunkBytes: data.length,
        });
      });
      networkStream.on("error", (err) => {
        if (settled) {
          return;
        }
        settled = true;
        traceError("socket.send.error", err, {
          connection: this.name,
          endpoint,
        });
        reject(err);
      });
      networkStream.on("end", () => {
        finish("end");
      });
      networkStream.on("close", () => {
        finish("close");
      });

      traceRequest("socket.send.start", {
        connection: this.name,
        endpoint,
        timeoutMs,
        hasPayload: !!byteMessage,
        payloadBytes: byteMessage?.length || 0,
          dmnid: parameters?.dmnid || "",
          responseMode: preserveRawResponse ? "raw-result" : "parsed",
          commandPreview: normalizeSocketCommand(parameters?.command).slice(0, 500),
      });

      if (byteMessage) {
        networkStream.write(byteMessage, (err) => {
          if (err) {
            reject(err);
          } else {
            traceRequest("socket.send.write", {
              connection: this.name,
              endpoint,
              payloadBytes: byteMessage.length,
            });
            if (!parameters?.command) {
              networkStream.end();
            }
            traceRequest("socket.send.finish", {
              connection: this.name,
              endpoint,
              halfClosed: !parameters?.command,
            });
          }
        });
      } else {
        networkStream.end();
        traceRequest("socket.send.finish", {
          connection: this.name,
          endpoint,
        });
      }
    });
    return result;
  }
  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IRoutingRequest>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    const result = await this.loadDataAsync(request);
    if (result.cms.webserver) {
      result.webserver = result.cms.webserver;
      delete result.cms.webserver;
    }
    if (result.cms.http) {
      result.http = result.cms.http;
      delete result.cms.http;
    }
    return result;
  }
}
