const http = require("http");
const HttpHostEndPoint = require("./HttpHostEndPoint");

class NonSecureHttpHostEndPoint extends HttpHostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {*} dispatcher
   */
  constructor(ip, port, dispatcher) {
    super(ip, port, dispatcher);
  }

  _createServer() {
    return http.createServer((req, res) => {
      var cms = this._createCmsObject(
        req.url,
        req.method,
        req.headers,
        req.socket
      );
      var result = this._dispatcher(cms);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    });
  }
}

module.exports = NonSecureHttpHostEndPoint;
