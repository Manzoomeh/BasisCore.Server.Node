import http from "http";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import RequestDispatcher from "./requestDispatcher.js";

class NonSecureHttpHostEndPoint extends HttpHostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {RequestDispatcher} dispatcher
   */
  constructor(ip, port, dispatcher) {
    super(ip, port, dispatcher);
  }

  _createServer() {
    return http.createServer((req, res) => {
      const cms = this._createCmsObject(
        req.url,
        req.method,
        req.headers,
        req.socket
      );
      const result = this._dispatcher.processAsync(cms);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    });
  }
}

export default NonSecureHttpHostEndPoint;
