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
    this._server = https
      .createServer(this.#options, async (req, res) => {
        /** @type {Request} */
        let cms = null;
        this._handleContentTypes(req, res, () => {
          const createCmsAndCreateResponseAsync = async () => {
            cms = await this._createCmsObjectAsync(
              req.url,
              req.method,
              req.headers,
              req.formFields,
              req.jsonHeaders ? req.jsonHeaders : {},
              req.socket,
              req.bodyStr,
              true
            );
            const result = await this.#service.processAsync(
              cms,
              req.fileContents
            );
            const [code, headers, body] = await result.getResultAsync();
            res.writeHead(code, headers);
            res.end(body);
          };
          try {
            createCmsAndCreateResponseAsync();
          } catch (ex) {
            console.error(ex);
            res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
            res.end(ex.toString());
          }
        });
      })
      .on("error", (er) => console.error(er))
      .on("clientError", (er) => console.error(er))
      .on("tlsClientError", (er) => console.error(er));
    return this._server;
  }
}
