import http from "http";
import dayjs from "dayjs";
import url from "url";
import HostEndPoint from "./hostEndPoint.js";
import Request from "../models/request.js";

var requestId = 0;
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
  _createServer() {}

  listen() {
    var server = this._createServer();
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
   * @param {Socket} socket
   * @returns {Request}
   */
  _createCmsObject(urlStr, method, headers, socket) {
    const rawUrl = urlStr.substring(1);
    const urlObject = url.parse(rawUrl, true);
    headers["request-id"] = (++requestId).toString();
    headers["methode"] = method.toLowerCase();
    headers["rawurl"] = rawUrl;
    headers["url"] = urlObject.pathname ?? "";
    headers["full-url"] = `${headers["host"]}${urlStr}`;
    headers["hostip"] = socket.localAddress;
    headers["hostport"] = socket.localPort.toString();
    headers["clientip"] = socket.remoteAddress;
    if (urlObject.query) {
      const query = {};
      var hasQuery = false;
      for (const key in urlObject.query) {
        query[key] = urlObject.query[key];
        hasQuery = true;
      }
      if (hasQuery) {
        headers["query"] = query;
      }
    }

    var now = dayjs();
    var request = new Request();
    request.request = headers;
    request.cms = {
      date: now.format("MM/DD/YYYY"),
      time: now.format("HH:mm A"),
      date2: now.format("YYYYMMDD"),
      time2: now.format("HHmmss"),
      date3: now.format("YYYY.MM.DD"),
    };
    return request;
  }
}

export default HttpHostEndPoint;
