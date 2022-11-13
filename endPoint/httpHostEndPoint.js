import dayjs from "dayjs";
import HostEndPoint from "./hostEndPoint.js";
import url from "url";
import RequestDispatcher from "./requestDispatcher.js";

var requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {RequestDispatcher} dispatcher
   */
  constructor(ip, port, dispatcher) {
    super(ip, port);
    this._dispatcher = dispatcher;
  }
  /**
   * @returns {Server}
   */
  _createServer() {
    throw new Error("Not implemented!");
  }

  listen() {
    var server = this._createServer();
    server
      .on("error", (x) => console.error(x))
      .listen(this._port, this._ip, () =>
        console.log(`start listening over ${this._ip}:${this._port}`)
      );
  }

  /**
   *
   * @param {string} urlStr
   * @param {string} method
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @param {Socket} socket
   * @returns {IRequestCms}
   */
  _createCmsObject(urlStr, method, headers, socket) {
    const rawUrl = urlStr.substring(1);
    const urlObject = url.parse(rawUrl, true);
    headers["request-id"] = (++requestId).toString();
    headers["methode"] = method.toLowerCase();
    headers["rawurl"] = rawUrl;
    headers["url"] = urlObject.pathname;
    headers["full-url"] = `${headers["host"]}${urlStr}`;
    headers["hostip"] = socket.localAddress;
    headers["hostport"] = socket.localPort.toString();
    headers["clientip"] = socket.remoteAddress;
    headers["query"] = urlObject.query;

    var now = dayjs();
    /**
     * @type IRequestCms
     */
    var cms = {
      request: headers,
      cms: {
        date: now.format("MM/DD/YYYY"),
        time: now.format("HH:mm A"),
        date2: now.format("YYYYMMDD"),
        time2: now.format("HHmmss"),
        date3: now.format("YYYY.MM.DD"),
      },
    };
    return cms;
  }
}

/**
 * @typedef {object} IRequestCms
 * @property {NodeJS.Dict<string | string[]>} cms
 * @property {NodeJS.Dict<string | string[]>} request
 */

export default HttpHostEndPoint;
