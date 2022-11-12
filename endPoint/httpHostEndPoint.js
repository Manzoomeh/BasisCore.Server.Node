const dayjs = require("dayjs");
const HostEndPoint = require("./hostEndPoint");
const url = require("url");

var requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {function(IRequestCms):IRequestCms} dispatcher
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
  _createCmsObject(urlStr, method, requestHeaders, socket) {
    const request = {};

    for (const key in requestHeaders) {
      request[key] = requestHeaders[key];
    }
    const rawUrl = urlStr.substring(1);
    const urlObject = url.parse(rawUrl, true);
    request["request-id"] = (++requestId).toString();
    request["methode"] = method.toLowerCase();
    request["rawurl"] = rawUrl;
    request["url"] = urlObject.pathname;
    request["full-url"] = `${request["host"]}${urlStr}`;
    request["hostip"] = socket.localAddress;
    request["hostport"] = socket.localPort.toString();
    request["clientip"] = socket.remoteAddress;

    requestHeaders["query"] = urlObject.query;

    var now = dayjs();
    /**
     * @type IRequestCms
     */
    var cms = {
      request: request,
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

// /**
//  * @typedef {object} IRequestDispatcher
//  * @property {function(IRequestCms): IRequestCms} Dispatch
//  */

module.exports = HttpHostEndPoint;
