import http from "http";
import dayjs from "dayjs";
import url from "url";
import HostEndPoint from "./hostEndPoint.js";
import Request from "../models/request.js";
import ObjectUtil from "../modules/objectUtil.js";
let requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port) {
    super(ip, port);
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
   * @returns {Promise<Request>}
   */
  async _createCmsObjectAsync(
    urlStr,
    method,
    headers,
    formFields,
    jsonHeaders,
    socket
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
    if (Object.keys(jsonHeaders).length > 0) {
      headers["json"] = ObjectUtil.convertObjectToNestedStructure(jsonHeaders);
    } else {
      headers["json"] = {};
    }
    const now = dayjs();
    const request = new Request();
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
    request["Form"] = formFields;
    return request;
  }
}

export default HttpHostEndPoint;
