import http from "http";
import dayjs from "dayjs";
import url from "url";
import HostEndPoint from "./hostEndPoint.js";
import Request from "../models/request.js";
import ObjectUtil from "../modules/objectUtil.js";
import busboy from "busboy";
import { IncomingMessage, ServerResponse } from "http";
import BasisCoreException from "../models/Exceptions/BasisCoreException.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";
import { Logger } from "winston";
import LoggerUtil from "../Log/LoggerUtil.js";

let requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /**@type {Server} */
  _server;
  /** @type {Logger} */
  _logger;
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port, rabbitSetting) {
    super(ip, port);
    this._logger = LoggerUtil.createContext(rabbitSetting);
  }

  /** @returns {Server}*/
  _createServer() {
    throw Error("_createServer not implemented in this type of end point!");
  }

  listen() {
    const server = this._createServer();
    server
      .on("error", (x) => console.error(x))
      .listen(this._port, this._ip, () =>
        console.log(`start listening over ${this._ip}:${this._port}`)
      );
  }

  /**
   * @param {string} urlStr
   * @param {string} method
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @param {NodeJS.Dict<string>} formFields
   * @param {Socket} socket
   * @param {NodeJS.Dict} bodyFields
   * @param {boolean} isSecure
   * @returns {Promise<Request>}
   */
  async _createCmsObjectAsync(
    urlStr,
    method,
    headers,
    formFields,
    jsonHeaders,
    socket,
    bodyStr,
    isSecure
  ) {
    const rawUrl = urlStr.substring(1);
    const urlObject = url.parse(rawUrl, true);
    headers["request-id"] = (++requestId).toString();
    headers["methode"] = method.toLowerCase();
    headers["rawurl"] = decodeURIComponent(rawUrl);
    headers["url"] = decodeURIComponent(urlObject.pathname ?? "");
    headers["full-url"] = decodeURIComponent(`${headers["host"]}${urlStr}`);
    headers["hostip"] = socket.localAddress;
    headers["hostport"] = socket.localPort.toString();
    headers["clientip"] = socket.remoteAddress;
    headers[":path"] = "/" + decodeURIComponent(rawUrl);
    if (Object.keys(jsonHeaders).length > 0) {
      headers["json"] = {
        header: ObjectUtil.convertObjectToNestedStructure(jsonHeaders),
      };
    } else {
      headers["json"] = {};
    }
    headers.body = bodyStr;
    const now = dayjs();
    const request = new Request();
    request.isSecure = isSecure;
    request.request = headers;
    request.cms = {
      date: now.format("MM/DD/YYYY"),
      time: now.format("HH:mm A"),
      date2: now.format("YYYYMMDD"),
      time2: now.format("HHmmss"),
      date3: now.format("YYYY.MM.DD"),
    };
    if (urlObject.query) {
      const query = {};
      let hasQuery = false;
      for (const key in urlObject.query) {
        query[key] = urlObject.query[key];
        hasQuery = true;
      }
      if (hasQuery) {
        request["query"] = query;
      }
    }
    request["form"] = formFields;
    return request;
  }
  /**
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  async _handleContentTypes(req, res, next) {
    let body = "";
    if (req.headers["content-length"]) {
      if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
        const bb = busboy({ headers: req.headers });
        /**@type {BinaryContent[]} */
        let fileContents = [];
        /**@type {NodeJS.Dict<string>} */
        let formFields = {};
        /**@type {NodeJS.Dict<string>} */
        let jsonHeaders = {};
        bb.on("file", (name, file, info) => {
          const ContentParts = [];
          file.on("data", (x) => ContentParts.push(x));
          file.on("end", async () => {
            const content = new BinaryContent();
            content.url = `${req.headers["host"]}${req.url}`;
            content.mime = info.mimeType.toLowerCase();
            content.name = info.filename;
            content.payload = Buffer.concat(ContentParts);
            fileContents.push(content);
          });
        });
        bb.on("field", (name, val, info) => {
          formFields[name] = val;
          if (name.startsWith("_")) {
            jsonHeaders[name] = val;
          }
        });
        bb.on("close", () => {
          req.formFields = formFields;
          req.fileContents = fileContents;
          req.jsonHeaders = jsonHeaders;
          next();
        });
        req.pipe(bb);
      } else {
        try {
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            if (body.length == 0) {
              next();
            } else {
              req.bodyStr = body;
              next();
            }
          });
        } catch (error) {
          throw new BasisCoreException("invalid JSON on body");
        }
      }
    } else {
      next();
    }
  }
  /**@returns void */
  kill() {
    this._server.close(() => {
      console.log(`http server with ${this._ip}:${this._port} downed`);
    });
  }
  _generateLogEntry(extraData) {
    return {
      schemaId: "8FCFD607-6A56-499B-98D5-E5A92502BBD5",
      paramUrl:
        "/E7E259BE-0434-40D9-8897-F45EF6940EF3/8FCFD607-6A56-499B-98D5-E5A92502BBD5/fa/log",
      schemaName: "log",
      schemaVersion: "1.0.0",
      lid: 1,
      baseVocab: "http://schema.site/FA/vo",
      properties: [
        {
          propId: 6292,
          multi: false,
          added: [{ parts: [{ part: 1, values: [{ value: extraData.url }] }] }],
        },
        {
          propId: 6293,
          multi: false,
          added: [
            { parts: [{ part: 1, values: [{ value: extraData.rawUrl }] }] },
          ],
        },
        {
          propId: 6294,
          multi: false,
          added: [
            { parts: [{ part: 1, values: [{ value: extraData.domain }] }] },
          ],
        },
        {
          propId: 6295,
          multi: false,
          added: [
            { parts: [{ part: 1, values: [{ value: extraData.pageid }] }] },
          ],
        },
        {
          propId: 6297,
          multi: false,
          added: [
            { parts: [{ part: 1, values: [{ value: extraData.requestId }] }] },
          ],
        },
        {
          propId: 6298,
          multi: false,
          added: [
            { parts: [{ part: 1, values: [{ value: extraData.errorType }] }] },
          ],
        },
        {
          propId: 6299,
          multi: false,
          added: [
            { parts: [{ part: 1, values: [{ value: extraData.message }] }] },
          ],
        },
        {
          propId: 6300,
          multi: false,
          added: [
            { parts: [{ part: 1, values: [{ value: extraData.level }] }] },
          ],
        },
      ],
    };
  }
}

export default HttpHostEndPoint;
