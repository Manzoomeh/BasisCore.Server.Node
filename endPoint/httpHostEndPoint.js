const dayjs = require("dayjs");
const HostEndPoint = require("./hostEndPoint");

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

  _processRequest(cms) {
    return cms;
  }

  /**
   *
   * @param {http.IncomingHttpHeaders} headers
   * @param {Socket} socket
   */
  _createCmsObject(headers, socket) {
    headers["request-id"] = (++requestId).toString();
    //headers["methode"] = headers[":method"].toLowerCase();
    //headers["rawurl"] = headers["url"] = headers[":path"].substring(1);
    //headers["full-url"] = `${headers[":authority"]}${headers[":path"]}`;
    headers["hostip"] = socket.localAddress;
    headers["hostport"] = socket.localPort.toString();
    headers["clientip"] = socket.remoteAddress;

    var cms = {
      cms: {
        request: headers,
        cms: {
          date: dayjs().format("MM/DD/YYYY"),
          time: dayjs().format("HH:mm A"),
          date2: dayjs().format("YYYYMMDD"),
          time2: dayjs().format("HHmmss"),
          date3: dayjs().format("YYYY.MM.DD"),
        },
      },
    };
    return cms;
  }
}

module.exports = HttpHostEndPoint;
