const http = require("http");
const https = require("https");
const fs = require("fs");
const HttpHostEndPoint = require("./HttpHostEndPoint");

class SecureHttpHostEndPoint extends HttpHostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port) {
    super(ip, port);
  }

  _createServer() {
    const options = {
      key: fs.readFileSync("test-cert/server.key"),
      cert: fs.readFileSync("test-cert/server.cert"),
    };
    /**
     *
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    const callBack = (req, res) => {
      console.log(req);
      var cms = this._createCmsObject(req.headers, req.socket);
      var result = this._processRequest(cms);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    };
    return https.createServer(options, callBack);
  }
}

module.exports = SecureHttpHostEndPoint;
