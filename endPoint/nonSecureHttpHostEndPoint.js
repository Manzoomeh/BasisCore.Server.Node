import http from "http";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import RequestDispatcher from "../services/requestDispatcher.js";

export default class NonSecureHttpHostEndPoint extends HttpHostEndPoint {
  /** @type {RequestDispatcher} */
  #dispatcher;

  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {RequestDispatcher} dispatcher
   */
  constructor(ip, port, dispatcher) {
    super(ip, port);
    this.#dispatcher = dispatcher;
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
        const result = await this.#dispatcher.processAsync(cms);
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
