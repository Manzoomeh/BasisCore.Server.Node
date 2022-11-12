const http2 = require("http2");
const fs = require("fs");
const SecureHttpHostEndPoint = require("./SecureHttpHostEndPoint");

class H2HttpHostEndPoint extends SecureHttpHostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port) {
    super(ip, port);
  }

  /**
   *
   * @param {http2.IncomingHttpHeaders} headers
   * @param {Socket} socket
   */
  _createCmsObject(headers, socket) {
    const cms = super._createCmsObject(headers, socket);
    cms.cms.request["methode"] = headers[":method"].toLowerCase();
    cms.cms.request["rawurl"] = headers["url"] = headers[":path"].substring(1);
    cms.cms.request["full-url"] = `${headers[":authority"]}${headers[":path"]}`;
    return cms;
  }

  _createServer() {
    const server = http2.createSecureServer({
      key: fs.readFileSync("test-cert/server.key"),
      cert: fs.readFileSync("test-cert/server.cert"),
      //pfx: fs.readFileSync("namayeshgah.ir.pfx"),
      //passphrase: "namayeshgah.ir",
    });
    server.on("stream", async (stream, headers) => {
      try {
        var cms = this._createCmsObject(headers, stream.session.socket);
        var result = this._processRequest(cms);
        stream.respond({
          ":status": 200,
        });
        stream.end(JSON.stringify(result));
      } catch (ex) {
        console.error(ex);
        if (ex.code != "ERR_HTTP2_INVALID_STREAM") {
          stream.respond({
            ":status": 500,
          });
          stream.end(ex.toString());
        }
      }
    });

    return server;
  }
}

module.exports = H2HttpHostEndPoint;
