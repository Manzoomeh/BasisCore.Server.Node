import https from "https";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import RequestDispatcher from "./requestDispatcher.js";

class SecureHttpHostEndPoint extends HttpHostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {RequestDispatcher} dispatcher
   * @param {import("tls").SecureContextOptions} options
   */
  constructor(ip, port, dispatcher, options) {
    super(ip, port, dispatcher);
    this._options = options;
  }

  _createServer() {
    return https.createServer(this._options, (req, res) => {
      var cms = this._createCmsObject(
        req.url,
        req.method,
        req.headers,
        req.socket
      );
      var result = this._dispatcher.processAsync(cms);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    });
  }
}

export default SecureHttpHostEndPoint;
