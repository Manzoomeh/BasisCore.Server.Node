import https from "https";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./httpHostEndPoint.js";
import { HostService } from "../Services/hostServices.js";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import url from "url";
import CacheSettings from "../Models/options/CacheSettings.js";
import {
  traceRequest,
  traceError,
  getRequestTraceId,
  resolveClientIp,
  getForwardedFor,
} from "../modules/requestTrace.js";

const IGNORED_TLS_ERROR_CODES = new Set([
  "ERR_SSL_TLSV1_ALERT_UNKNOWN_CA",
  "ERR_SSL_SSLV3_ALERT_BAD_CERTIFICATE",
  "ERR_SSL_SSLV3_ALERT_CERTIFICATE_UNKNOWN",
  "ECONNRESET",
]);

/**
 * Suppress noisy TLS handshake errors from clients that bypass Cloudflare and
 * do not trust Origin CA certificates.
 * @param {NodeJS.ErrnoException & { reason?: string }} error
 * @returns {boolean}
 */
function isIgnoredTlsNoise(error) {
  const code = String(error?.code || "");
  if (IGNORED_TLS_ERROR_CODES.has(code)) {
    return true;
  }
  const reason = String(error?.reason || "").toLowerCase();
  return reason.includes("unknown ca");
}

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
    this.#options = options || {};
  }

  _createServer() {
    this._server = https
      .createServer(this.#options, async (req, res) => {
        const startedAt = Date.now();
        if (this._checkIpBlockForHttp(req, res, "https")) {
          return;
        }
        if (this._checkHostPolicyForHttp(req, res, "https")) {
          return;
        }
        const clientIp = resolveClientIp({ headers: req?.headers, socket: req?.socket });
        const forwardedFor = getForwardedFor({ headers: req?.headers });
        /** @type {Request} */
        let cms = null;
        traceRequest("endpoint.https.request.start", {
          protocol: "https",
          method: req?.method || "",
          url: req?.url || "",
          host: req?.headers?.host || "",
          tlsServerName: req?.socket?.servername || "",
          clientIp,
          forwardedFor,
        });
        this._sqlInjectionMiddleware(req, res, async () => {
          this._securityHeadersMiddleware(req, res, async () => {
            if (this._handleCorsPreflight(req, res)) {
              traceRequest("endpoint.https.request.preflight", {
                method: req?.method || "",
                url: req?.url || "",
              });
              return;
            }
            this._handleContentTypes(req, res, async () => {
              this._checkCacheAsync(req, res, async () => {
                const createCmsAndCreateResponseAsync = async () => {
                  // console.log("qam 1",req.headers.host,req.url)
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
                  const responseTuple = await result.getResultAsync(
                    routingDataStep,
                    rawRequest,
                    debugCondition ? cms.dict : undefined
                  );
                  if (!Array.isArray(responseTuple) || responseTuple.length < 3) {
                    throw new Error("invalid response tuple from getResultAsync");
                  }
                  const [code, headers, body] = responseTuple;
                  const statuscode = Number(
                    result?._request?.webserver?.headercode?.split?.(" ")?.[0] || code || 200
                  );
                  if (statuscode != 301 && statuscode != 302) {
                    this.addCacheContentAsync(
                      `https://${req.headers.host}${req.url}`,
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
                  traceRequest("endpoint.https.response.sent", {
                    traceId: getRequestTraceId({ headers: req?.headers }),
                    protocol: "https",
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
                  traceError("endpoint.https.request.error", ex, {
                    traceId: getRequestTraceId({ headers: req?.headers }),
                    protocol: "https",
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
      })
      .on("error", (er) => console.error(er))
      .on("clientError", (er, socket) => {
        traceError("endpoint.https.client_error", er, {
          remoteAddress: socket?.remoteAddress || "",
          remotePort: socket?.remotePort || "",
          localAddress: socket?.localAddress || "",
          localPort: socket?.localPort || "",
        });
        if (!isIgnoredTlsNoise(er)) {
          console.error(er);
        }
      })
      .on("tlsClientError", (er, tlsSocket) => {
        traceError("endpoint.https.tls_client_error", er, {
          remoteAddress: tlsSocket?.remoteAddress || "",
          remotePort: tlsSocket?.remotePort || "",
          localAddress: tlsSocket?.localAddress || "",
          localPort: tlsSocket?.localPort || "",
          servername: tlsSocket?.servername || "",
          alpnProtocol: tlsSocket?.alpnProtocol || "",
          authorized: !!tlsSocket?.authorized,
          authorizationError: tlsSocket?.authorizationError || "",
        });
        if (!isIgnoredTlsNoise(er)) {
          console.error(er);
        }
      });
    return this._server;
  }
}
