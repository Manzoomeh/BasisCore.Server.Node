const http = require("http");
const HttpHostEndPoint = require("./HttpHostEndPoint");

class NonSecureHttpHostEndPoint extends HttpHostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port) {
    super(ip, port);
  }

  _createServer() {
    /**
     *
     * @param {http.IncomingMessage} req
     * @param {http.ServerResponse} res
     */
    //const owner = this;
    const requestListener = (req, res) => {
      var cms = this._createCmsObject(req.headers, req.socket);
      var result = this._processRequest(cms);
      res.writeHead(200);
      res.end(JSON.stringify(result));
    };
    return http.createServer(requestListener);
  }
}
module.exports = NonSecureHttpHostEndPoint;
