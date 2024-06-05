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
import HostService from "../services/hostService.js";
import RabbitMQCacheUtil from "./../Models/CacheCommands/RabbitMQCacheUtil.js";
import BaseCacheUtil from "../Models/CacheCommands/BaseCacheUtil.js";

let requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /** @type {HostService} */
  _service;
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port, service) {
    super(ip, port);
    this._service = service;
  }

  /** @returns {Server}*/
  _createServer() {
    throw Error("_createServer not implemented in this type of end point!");
  }

  /**@returns {Promise<void>} */
  async listenAsync() {
    /** @type {BaseCacheUtil} */
    let cacheUtil;
    switch (this._service._options?.CacheSettings.utilType) {
      case "Rabbit": {
        cacheUtil = new RabbitMQCacheUtil(
          this._service.settings.cacheConnection,
          this._service._options.CacheSettings.utilSetting
        );
      }
    }
    if (cacheUtil) {
      await cacheUtil.connectAsync();
      await cacheUtil.createDeleteChannel()
    }
    const server = this._createServer();
    await this.initializeAsync();
    server
      .on("error", (x) => console.error(x))
      .listen(this._port, this._ip, () => {
        console.log(`start listening over ${this._ip}:${this._port}`);
      });
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
  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  async _checkCacheAsync(req, res, next) {
    if (
      this._service._options.CacheSettings?.isEnabled &&
      this._service._options.CacheSettings.requestMethods.includes(req.method)
    ) {
      let connection = this._service.settings.cacheConnection;
      const fullUrl = `${req.headers.host}${req.url}`;
      const cacheResults = await connection.loadContentAsync(fullUrl);
      if (cacheResults) {
        res.writeHead(200, {
          ...cacheResults.properties,
        });
        res.write(cacheResults.content ?? "");
        res.end();
      } else {
        next();
      }
    } else {
      next();
    }
  }
  /**
   *
   * @param {string} key
   * @param {string} content
   * @param {NodeJS.Dict<string>} headers
   * @returns {Promise<void>}
   */
  async addCacheContentAsync(key, content, headers, method) {
    if (
      this._service._options.CacheSettings?.isEnabled &&
      this._service._options.CacheSettings.requestMethods.includes(method)
    ) {
      const savedHeaders = this.findProperties(
        headers,
        this._service._options.CacheSettings.responseHeaders
      );
      await this._service.settings.cacheConnection.addCacheContentAsync(
        key,
        content,
        savedHeaders
      );
    }
  }
  /**
   *
   * @param {NodeJS.Dict} headers
   * @param {string[]} keys
   * @returns
   */
  findProperties(headers, keys) {
    const properties = {};
    keys.forEach((key) => {
      if (headers.hasOwnProperty(key)) {
        properties[key] = headers[key];
      }
    });
    return properties;
  }
  async initializeAsync() {
    return this._service.initializeAsync();
  }
}
export default HttpHostEndPoint;
