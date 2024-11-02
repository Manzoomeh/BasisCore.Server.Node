import http from "http";
import url from "url";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import StringResult from "../renderEngine/Models/StringResult.js";
import fs from "fs";

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
    this._server = http.createServer(async (req, res) => {
      try {
        this._securityHeadersMiddleware(req, res, async () => {
          this._handleContentTypes(req, res, async () => {
            this._checkCacheAsync(req, res, false, async () => {
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
                /** @type {Request} */
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
                let result = await this._service.processAsync(
                  cms,
                  req.fileContents
                );
                let cachecms;
                if (result.result) {
                 
                  cachecms = result.responseCms;
                   result = result.result;
                }
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
                    `http://${req.headers.host}${req.url}`,
                    body,
                    headers,
                    req.method,
                    cachecms
                  );
                }
                res.writeHead(code, headers);
                res.end(body);
              };
              await createCmsAndCreateResponseAsync();
            });
          });
        });
      } catch (ex) {
        console.error(ex);
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(ex.toString());
      }
    });
    return this._server;
  }
}
