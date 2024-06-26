import http from "http";
import url from "url";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import StringResult from "../renderEngine/Models/StringResult.js";

export default class NonSecureHttpHostEndPoint extends HttpHostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   */
  constructor(ip, port, service, cacheOptions) {
    super(ip, port, service, cacheOptions);
  }

  _createServer() {
    this._server =  http.createServer(async (req, res) => {
      try {
        /** @type {Request} */
        this._handleContentTypes(req, res, async () => {
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
              let cms = await this._createCmsObjectAsync(
                req.url,
                req.method,
                req.headers,
                req.formFields,
                req.jsonHeaders ? req.jsonHeaders : {},
                req.socket,
                req.bodyStr,
                false
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
            await createCmsAndCreateResponseAsync();
          });
        });
      } catch (ex) {
        console.error(ex);
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(ex.toString());
      }
    });
    return this._server
  }
}
