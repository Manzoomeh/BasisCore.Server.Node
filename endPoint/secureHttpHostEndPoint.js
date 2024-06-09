import https from "https";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import url from "url";

export default class SecureHttpHostEndPoint extends HttpHostEndPoint {
  /** @type {import("tls").SecureContextOptions} */
  #options;
  /**
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   * @param {import("tls").SecureContextOptions} options
   */
  constructor(ip, port, service, options) {
    super(ip, port, service);
    this.#options = options;
  }

  _createServer() {
    return https
      .createServer(this.#options, async (req, res) => {
        /** @type {Request} */
        let cms = null;
        this._handleContentTypes(req, res, () => {
          this._checkCacheAsync(req, res, async () => {
          const createCmsAndCreateResponseAsync = async () => {
            const queryObj = url.parse(req.url, true).query;
            let routingDataStep =
              queryObj.debug == "true" ||
              queryObj.debug == "1" ||
              queryObj.debug == "2"
                ? new LightgDebugStep(null, "Get Routing Data")
                : null;
            let rawRequest =
              queryObj.debug == "true" ||
              queryObj.debug == "1" ||
              queryObj.debug == "2"
                ? this.joinHeaders(req.rawHeaders)
                : null;
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
            const result = await this._service.processAsync(
              cms,
              req.fileContents
            );
            routingDataStep?.complete();
            const [code, headers, body] = await result.getResultAsync(
              routingDataStep,
              rawRequest,
              queryObj.debug == "true" ||
                queryObj.debug == "1" ||
                queryObj.debug == "2"
                ? cms.dict
                : undefined
            );
            this.addCacheContentAsync(
              `${req.headers.host}${req.url}`,
              body,
              headers,
              req.method
            );
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
        });
      })
      .on("error", (er) => console.error(er))
      .on("clientError", (er) => console.error(er))
      .on("tlsClientError", (er) => console.error(er));
  }
}
