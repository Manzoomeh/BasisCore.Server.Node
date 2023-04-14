import http from "http";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";

export default class NonSecureHttpHostEndPoint extends HttpHostEndPoint {
  /** @type {HostService} */
  #service;

  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   */
  constructor(ip, port, service) {
    super(ip, port);
    this.#service = service;
  }

  _createServer() {
    return http.createServer(async (req, res) => {
      try {
        const cms = this._createCmsObject(
          req.url,
          req.method,
          req.headers,
          req.socket
        );
        const result = await this.#service.processAsync(cms);
        const [code, headers, body] = await result.getResultAsync();
        res.writeHead(code, headers);
        res.end(body);
      } catch (ex) {
        console.error(ex);
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(ex.toString());
      }
    });
  }
}
