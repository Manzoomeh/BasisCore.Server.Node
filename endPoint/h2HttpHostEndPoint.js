const http2 = require("http2");

const SecureHttpHostEndPoint = require("./SecureHttpHostEndPoint");

class H2HttpHostEndPoint extends SecureHttpHostEndPoint {
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

  /**
   *
   * @param {string} urlStr
   * @param {string} method
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @param {Socket} socket
   * @returns {RequestCms}
   */
  _createCmsObject(urlStr, method, requestHeaders, socket) {
    const cms = super._createCmsObject(urlStr, method, requestHeaders, socket);
    cms.request[
      "full-url"
    ] = `${requestHeaders[":authority"]}${requestHeaders[":path"]}`;
    return cms;
  }

  _createServer() {
    const server = http2.createSecureServer(this._options);
    server.on("stream", async (stream, headers) => {
      try {
        var cms = this._createCmsObject(
          headers[":path"],
          headers[":method"],
          headers,
          stream.session.socket
        );
        var result = this._dispatcher(cms);
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
