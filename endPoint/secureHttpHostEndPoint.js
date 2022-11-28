import https from "https";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";

export default class SecureHttpHostEndPoint extends HttpHostEndPoint {
  /** @type {HostService} */
  #service;

  /** @type {import("tls").SecureContextOptions} */
  #options;
  /**
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   * @param {import("tls").SecureContextOptions} options
   */
  constructor(ip, port, service, options) {
    super(ip, port);
    this.#options = options;
    this.#service = service;
  }

  _createServer() {
    return https
      .createServer(this.#options, async (req, res) => {
        try {
          var cms = this._createCmsObject(
            req.url,
            req.method,
            req.headers,
            req.socket
          );
          var result = await this.#service.processAsync(cms);
          const [code, headers, body] = await result.getResultAsync();
          res.writeHead(code, headers);
          res.end(body);
        } catch (ex) {
          console.error(ex);
          res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
          res.end(ex.toString());
        }
      })
      .on("error", (er) => console.error(er))
      .on("clientError", (er) => console.error(er))
      .on("tlsClientError", (er) => console.error(er));
  }
}
