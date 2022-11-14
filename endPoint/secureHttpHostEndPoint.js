import https from "https";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import RequestDispatcher from "./requestDispatcher.js";

class SecureHttpHostEndPoint extends HttpHostEndPoint {
  /** @type {RequestDispatcher} */
  #dispatcher;

  /** @type {import("tls").SecureContextOptions} */
  #options;
  /**
   * @param {string} ip
   * @param {number} port
   * @param {RequestDispatcher} dispatcher
   * @param {import("tls").SecureContextOptions} options
   */
  constructor(ip, port, dispatcher, options) {
    super(ip, port);
    this.#options = options;
    this.#dispatcher = dispatcher;
  }

  _createServer() {
    return https.createServer(this.#options, async (req, res) => {
      try {
        var cms = this._createCmsObject(
          req.url,
          req.method,
          req.headers,
          req.socket
        );
        var result = this.#dispatcher.process(cms);
        const [code, headers, body] = await result.getResultAsync();
        res.writeHead(code, headers);
        res.end(body);
      } catch (ex) {
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(ex.toString());
      }
    });
  }
}

export default SecureHttpHostEndPoint;
