import http from "http";
import url from "url";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./httpHostEndPoint.js";
import { HostService } from "../Services/hostServices.js";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import StringResult from "../renderEngine/Models/StringResult.js";
import fs from "fs";
import {
  traceRequest,
  traceError,
  getRequestTraceId,
  resolveClientIp,
  getForwardedFor,
} from "../modules/requestTrace.js";

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
      const startedAt = Date.now();
      if (this._checkIpBlockForHttp(req, res, "http1")) {
        return;
      }
      if (this._checkHostPolicyForHttp(req, res, "http1")) {
        return;
      }
      const clientIp = resolveClientIp({ headers: req?.headers, socket: req?.socket });
      const forwardedFor = getForwardedFor({ headers: req?.headers });
      console.log("request " + req.url);
      traceRequest("endpoint.http.request.start", {
        protocol: "http1",
        method: req?.method || "",
        url: req?.url || "",
        host: req?.headers?.host || "",
        clientIp,
        forwardedFor,
      });
      this._sqlInjectionMiddleware(req, res, async () => {
        this._securityHeadersMiddleware(req, res, async () => {
          if (this._handleCorsPreflight(req, res)) {
            traceRequest("endpoint.http.request.preflight", {
              method: req?.method || "",
              url: req?.url || "",
            });
            return;
          }
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
                const result = await this._service.processAsync(
                  cms,
                  req.fileContents
                );
                routingDataStep?.complete();
                const responseTuple = await result.getResultAsync(
                  routingDataStep,
                  rawRequest,
                  debugCondition ? cms.dict : undefined
                );
                if (!Array.isArray(responseTuple) || responseTuple.length < 3) {
                  throw new Error("invalid response tuple from getResultAsync");
                }
                let [code, headers, body] = responseTuple;
                const statuscode = Number(
                  result?._request?.webserver?.headercode?.split?.(" ")?.[0] || code || 200
                );
                if (statuscode != 301 && statuscode != 302) {
                  this.addCacheContentAsync(
                    `http://${req.headers.host}${req.url}`,
                    body,
                    headers,
                    req.method
                  );
                }
                const [safeCode, safeHeaders, safeBody] = this._prepareOutgoingResponse(
                  code,
                  headers,
                  body,
                  req.headers
                );
                res.writeHead(safeCode, safeHeaders);
                res.end(safeBody);
                traceRequest("endpoint.http.response.sent", {
                  traceId: getRequestTraceId({ headers: req?.headers }),
                  protocol: "http1",
                  method: req?.method || "",
                  url: req?.url || "",
                  statusCode: safeCode,
                  elapsedMs: Date.now() - startedAt,
                  clientIp,
                  forwardedFor,
                });
              };
              try {
                await createCmsAndCreateResponseAsync();
              } catch (ex) {
                traceError("endpoint.http.request.error", ex, {
                  traceId: getRequestTraceId({ headers: req?.headers }),
                  protocol: "http1",
                  method: req?.method || "",
                  url: req?.url || "",
                  elapsedMs: Date.now() - startedAt,
                  clientIp,
                  forwardedFor,
                });
                this._writeSafeInternalError(res, ex);
              }
            });
          });
        });
      });
    });
    return this._server;
  }
}
