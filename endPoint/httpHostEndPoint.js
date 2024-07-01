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
import StringResult from "../renderEngine/Models/StringResult.js";
import HostService from "../services/hostService.js";
import RabbitMQCacheManager from "./../Models/CacheCommands/RabbitMQCacheManager.js";
import BasecacheManager from "../Models/CacheCommands/BasecacheManager.js";
import CacheConnectionBase from "../models/CacheCommands/CacheConnection/CacheConnectionBase.js";
import { HostEndPointOptions } from "../models/model.js";
import SqliteCacheConnection from "../models/CacheCommands/CacheConnection/SqliteCacheConnection.js";
import CacheSettings from "../models/options/CacheSettings.js";

let requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /** @type {HostService} */
  _service;
  /** @type {HostEndPointOptions} */
  _cacheOptions;
  /** @type {CacheConnectionBase?} */
  _cacheConnection;
  /** @type {http.Server} */
  _server
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {HostService}
   * @param {CacheSettings}cacheOptions
   */
  constructor(ip, port, service,cacheOptions) {
    super(ip, port);
    this._service = service;
    this._cacheOptions = cacheOptions;
    if (cacheOptions && cacheOptions.connectionType) {
      switch (cacheOptions.connectionType) {
        case "sqlite": {
          this._cacheConnection = new SqliteCacheConnection(
            cacheOptions.connectionSetting
          );
          break;
        }
        default: {
          throw new BasisCoreException(
            `the connection type ${cacheOptions.connectionType} not implemented for caching!`
          );
        }
      }
    }
  }

  /** @returns {Server}*/
  _createServer() {
    throw Error("_createServer not implemented in this type of end point!");
  }

  /**@returns {Promise<void>} */
  async listenAsync() {
    /** @type {BasecacheManager} */
    let cacheManager;
    switch (this._cacheOptions?.managerType) {
      case "Rabbit": {
        cacheManager = new RabbitMQCacheManager(
          this._cacheConnection,
          this._cacheOptions.managerSetting
        );
      }
    }
    if (cacheManager) {
      await cacheManager.initializeAsync();
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
  _securityHeadersMiddleware(req, res, next) {
    req.url = req.url.replace(/[\r\n]+[ \t]*/g, '')
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  
    if (typeof next === 'function') {
      next();
    }
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
  addStringTable(title, content) {
    const html = `
          <table class='cms-data-member'>
              <thead>
                  <tr>
                      <th>${title}</th>                   
                  </tr>
                  <tr>
                      <th>Value</th>                   
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>${content}</td>
                  </tr>
              </tbody>
          </table>
      `;
    return new StringResult(html);
  }
  joinHeaders(array) {
    const joinedheaders = array
      .reduce((acc, curr, index, arr) => {
        if (index % 2 === 0) {
          acc.push(arr.slice(index, index + 2).join(" : "));
        }
        return acc;
      }, [])
      .join("<br>");
  }
  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  async _checkCacheAsync(req, res, next) {
    const urlObject = url.parse(req.url, true);
    if (
      !urlObject?.query.refresh &&
      this._cacheOptions &&
      this._cacheOptions.isEnabled &&
      this._cacheOptions.requestMethods.includes(req.method) &&
      this._cacheConnection
    ) {
      const fullUrl = `${req.headers.host}${req.url}`;
      const cacheResults = await this._cacheConnection.loadContentAsync(
        fullUrl
      );
      if (cacheResults) {
        res.writeHead(200, {
          ...cacheResults.properties,
        });
        res.write(cacheResults.file ?? "");
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
      this._cacheOptions &&
      this._cacheOptions.isEnabled &&
      this._cacheOptions.requestMethods.includes(method) &&
      this._cacheConnection
    ) {
      const savedHeaders = this.findProperties(
        headers,
        this._cacheOptions.responseHeaders
      );
      await this._cacheConnection.addCacheContentAsync(
        key,
        content,
        savedHeaders
      );
    }
  }
  sanitizeInput(input) {
    let inputStr = String(input);
    inputStr = inputStr.replace(/[\r\n]/g, '');

    return inputStr;
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
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        properties[key] = headers[key];
      }
    });
    return properties;
  }
  initializeAsync() {
    return this._service.initializeAsync();
  }
  kill(){
     this._server.close()
     console.log(`server ip ${this._ip} and port ${this._port} killed`)
  }
}
export default HttpHostEndPoint;
