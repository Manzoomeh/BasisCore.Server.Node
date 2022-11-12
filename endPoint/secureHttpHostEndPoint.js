const http = require("http");
const https = require("https");
const HttpHostEndPoint = require("./HttpHostEndPoint");

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
      var result = this._dispatcher(cms);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    });
  }
}

module.exports = SecureHttpHostEndPoint;
