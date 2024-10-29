import https from "https";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import url from "url";
import CacheSettings from "../models/options/CacheSettings.js";

export default class SecureHttpHostEndPoint extends HttpHostEndPoint {
  /** @type {import("tls").SecureContextOptions} */
  #options;
  /**
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   * @param {import("tls").SecureContextOptions} options
   * @param {CacheSettings} cacheSetting
   */
  constructor(ip, port, service, options, cacheSetting) {
    super(ip, port, service, cacheSetting);
    if (this.#options) {
      this.#options = options;
      (this.#options.ciphers = [
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256",
        "TLS_AES_128_GCM_SHA256",
        "ECDHE-RSA-AES256-GCM-SHA384",
        "ECDHE-RSA-AES128-GCM-SHA256",
      ].join(":")),
        (this.#options.honorCipherOrder = true);
      this.#options.minVersion = "TLSv1.2";
    }
  }

  _createServer() {
    this._server = https
      .createServer(this.#options, async (req, res) => {
        /** @type {Request} */
        let cms = null;
        this._securityHeadersMiddleware(req, res, async () => {
          this._handleContentTypes(req, res, async () => {
            this._checkCacheAsync(req, res, async () => {
              const createCmsAndCreateResponseAsync = async () => {
                const queryObj = url.parse(req.url, true).query;
                let debugCondition =
                  queryObj.debug == "true" ||
                  queryObj.debug == "1" ||
                  queryObj.debug == "2";
                let routingDataStep = debugCondition
                  ? new LightgDebugStep(null, "Get Routing Data")
                  : null;
                let rawRequest = debugCondition
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
                  debugCondition ? cms.dict : undefined
                );
                const statuscode = Number(
                  result._request.webserver.headercode.split(" ")[0]
                );
                if (statuscode != 301 && statuscode != 302) {
                  this.addCacheContentAsync(
                    `https://${req.headers.host}${req.url}`,
                    body,
                    headers,
                    req.method,
                    cms
                  );
                }

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
        });
      })
      .on("error", (er) => console.error(er))
      .on("clientError", (er) => console.error(er))
      .on("tlsClientError", (er) => console.error(er));
    return this._server;
  }
}
