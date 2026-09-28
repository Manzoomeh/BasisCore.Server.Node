import http2 from "http2";
import busboy from "busboy";
import { StatusCodes } from "http-status-codes";
import SecureHttpHostEndPoint from "./secureHttpHostEndPoint.js";
import HostService from "../Services/hostService.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";
import http from "http";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import url from "url";
import CacheSettings from "../Models/options/CacheSettings.js";
const { HTTP2_HEADER_AUTHORITY } = http2.constants;
import {
  parseBodyFormFields,
  shouldCollectRequestBody,
} from "../modules/requestBody.js";
import {
  traceRequest,
  traceIncomingHttp2Stream,
  traceIncomingHttpRequest,
  traceError,
  getRequestTraceId,
} from "../modules/requestTrace.js";

const decodeURIComponentSafe = (s) => {
  try {
      return decodeURIComponent(s);
  } catch {
      return s; // Return as-is if decoding fails
  }
}
export default class H2HttpHostEndPoint extends SecureHttpHostEndPoint {
  /** @type {import("tls").SecureContextOptions} */
  #options;

  /**
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   * @param {import("tls").SecureContextOptions} options
   * @param {CacheSettings} cacheSettings
   */

  constructor(ip, port, service, options, cacheSettings) {
    super(ip, port, service, null, cacheSettings);
    this.#options = options || {};
    this.#options.allowHTTP1 = true;
  }

  /**
   * @param {string} urlStr
   * @param {string} method
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @param {NodeJS.Dict<string>[]} formFields
   * @param {BinaryContent[]} fileContents
   * @param {Socket} socket
   * @param {boolean} isSecure
   * @returns {Promise<RequestCms>}
   */
  async _createCmsObjectAsync(
    urlStr,
    method,
    requestHeaders,
    formFields,
    fileContents,
    socket,
    body,
    isSecure
  ) {
    const cms = await super._createCmsObjectAsync(
      urlStr,
      method,
      requestHeaders,
      formFields,
      fileContents,
      socket,
      body,
      isSecure
    );
    cms.request["host"] = requestHeaders[":authority"];
    cms.request[
      "full-url"
    ] = `${cms.request["host"]}${requestHeaders[":path"]}`;
    return cms;
  }
  _sqlInjectionMiddleware = (stream, headers) => {
    // const reqUrl = headers[http2.constants.HTTP2_HEADER_PATH] || '';
    // const host = headers[http2.constants.HTTP2_HEADER_AUTHORITY] || 'localhost';
    // const url = new URL(reqUrl, `https://${host}`);
    // const queryString = decodeURIComponentSafe(url.search); // Decode URI components

    // // Case-insensitive regex pattern to match common SQL injection patterns
    // const sqlInjectionPattern = /(?:\b(SELECT|INSERT|DELETE|UPDATE|WHERE|DROP|EXEC|UNION|--|\*|#)\b.*?[=;]|\b(OR|AND)\b\s*?['"\d])/i;

    // // Check the query string for SQL injection patterns
    // return sqlInjectionPattern.test(queryString);
    return false
};
  _createServer() {
    this._server = http2
      .createSecureServer(this.#options)
      .on("stream", async (stream, headers) => {
        const startedAt = Date.now();
        if (this._checkIpBlockForHttp2(stream, headers, "http2")) {
          return;
        }
        if (this._checkHostPolicyForHttp2(stream, headers, "http2")) {
          return;
        }
        traceIncomingHttp2Stream(headers);
        traceRequest("endpoint.http2.request.start", {
          protocol: "http2",
          method: headers?.[":method"] || "",
          url: headers?.[":path"] || "",
          host: headers?.[":authority"] || "",
        });
        if (this._handleCorsPreflightH2(stream, headers)) {
          traceRequest("endpoint.http2.request.preflight", {
            method: headers?.[":method"] || "",
            url: headers?.[":path"] || "",
          });
          return;
        }
        if (this._sqlInjectionMiddleware(stream, headers)) {
          stream.respond(
            this._withCommonResponseHeaders({
              ":status": 400,
              "content-type": "text/plain",
            })
          );
          return stream.end("Bad Request: Potential SQL injection detected.");
        }
        this._checkCacheAsync(stream, headers, async () => {
          /** @type {Request} */
          let cms = null;
          /** @type {BinaryContent[]} */
          const fileContents = [];
          /** @type {NodeJS.Dict<string>} */
          const jsonHeaders = {};
          /** @type {NodeJS.Dict<string>} */
          let formFields = {};
          const method = headers[":method"];
          const reqUrl = headers[":path"];
          let bodyStr = "";

          const createCmsAndCreateResponseAsync = async () => {
            const { query: queryObj } = url.parse(reqUrl, true);
            let debugCondition =
            queryObj.debug == "true" ||
            queryObj.debug == "1" ||
            queryObj.debug == "2";
            let rawRequest = debugCondition
            ? this.addStringTable("Raw Request", JSON.stringify(headers))
            : null;
            let routingDataStep = debugCondition
            ? new LightgDebugStep(null, "Get Routing Data")
            : null;
            cms = await this._createCmsObjectAsync(
              reqUrl.replace(/[\n\r]|%0a|%0d/gi, " "),
              method,
              headers,
              formFields,
              jsonHeaders,
              stream.session.socket,
              bodyStr,
              true
            );
            // console.log("start http2 session", headers[":path"],cms)
            const result = await this._service.processAsync(cms, fileContents);

            if (routingDataStep) routingDataStep.complete();
            const responseTuple = await result.getResultAsync(
              routingDataStep,
              rawRequest,
              debugCondition ? cms.dict : undefined
            );
            if (!Array.isArray(responseTuple) || responseTuple.length < 3) {
              throw new Error("invalid response tuple from getResultAsync");
            }
            const [code, headerList, body] = responseTuple;
            await this.addCacheContentAsync(
              `${headers.host}${headers[":path"]}`,
              body,
              headerList,
              headers[":method"]
            );
            const finalHeaders = this._mergeCorsHeaders(headerList, headers);
            stream.respond(
              this._withCommonResponseHeaders({
                ...finalHeaders,
                ":status": code,
                "Strict-Transport-Security":
                  "max-age=15552000; includeSubDomains; preload",
                "X-Content-Type-Options": "nosniff",
                // "X-Frame-Options": "DENY",
                "X-XSS-Protection": "1; mode=block",
              })
            );
            stream.end(body);
            traceRequest("endpoint.http2.response.sent", {
              protocol: "http2",
              method: headers?.[":method"] || "",
              url: headers?.[":path"] || "",
              statusCode: code,
              elapsedMs: Date.now() - startedAt,
            });
          };

          stream.on("data", (chunk) => {
            if (shouldCollectRequestBody(headers["content-type"])) {
              bodyStr += chunk;
            }
          });

          stream.on("end", async () => {
            const parsedFormFields = parseBodyFormFields(
              bodyStr,
              headers["content-type"]
            );
            if (parsedFormFields) {
              formFields = parsedFormFields;
            }
            await createCmsAndCreateResponseAsync();
          });

          stream.on("error", (ex) => {
            if (ex.code != "ERR_STREAM_WRITE_AFTER_END") {
              traceError("endpoint.http2.stream.error", ex, {
                method: headers?.[":method"] || "",
                url: headers?.[":path"] || "",
              });
            }
            stream.destroy(ex);
          });

          try {
            if (headers["content-length"]) {
              if (headers["content-type"]?.startsWith("multipart/form-data")) {
                /** @type {Array<BinaryContent>} */
                const bb = busboy({ headers: headers });
                bb.on("file", (name, file, info) => {
                  const ContentParts = [];
                  file.on("data", (x) => ContentParts.push(x));
                  file.on("end", async () => {
                    const content = new BinaryContent();
                    content.url = `${headers["host"]}${reqUrl}`;
                    content.mime = info.mimeType.toLowerCase();
                    content.name = info.filename;
                    content.payload = Buffer.concat(ContentParts);
                    fileContents.push(content);
                  });
                });
                bb.on("field", (name, val, info) => {
                  formFields[name] = val;
                  if (name.startsWith("_")) {
                    jsonHeaders[name] = val;
                  }
                });
                bb.on("close", createCmsAndCreateResponseAsync);
                stream.pipe(bb);
              } else {
                // await createCmsAndCreateResponseAsync();
              }
            }
          } catch (ex) {
            if (ex.code != "ERR_HTTP2_INVALID_STREAM") {
              traceError("endpoint.http2.request.error", ex, {
                method: headers?.[":method"] || "",
                url: headers?.[":path"] || "",
              });
              try {
                stream.respond(
                  this._withCommonResponseHeaders({
                    ":status": StatusCodes.INTERNAL_SERVER_ERROR,
                  })
                );
              } catch (ex) {
                console.error("HTTP/2 server error", ex);
              }
              stream.end(ex.toString());
            }
          }
        });
      })
      .on("clientError", (ex) => {
        switch (ex.code) {
          case "ERR_SSL_TLSV1_ALERT_UNKNOWN_CA":
          case "ERR_SSL_SSLV3_ALERT_BAD_CERTIFICATE":
          case "ERR_SSL_SSLV3_ALERT_CERTIFICATE_UNKNOWN":
          case "ECONNRESET": {
            break;
          }
          default: {
            console.error("HTTP/2 server clientError", ex);
            break;
          }
        }
      })
      .on("error", (ex) => console.error("HTTP/2 server error", ex))
      .on("sessionError", (ex) => {
        console.error("HTTP/2 server sessionError", ex)
      })
      .on("unknownProtocol", (ex) => {
        console.error("HTTP/2 server unknownProtocol", ex)
      })
      .on("session", (session) => {
        session.on("error", (ex) => {
          if (ex?.code === "ECONNRESET") {
            console.warn("HTTP/2 session connection reset.");
          } else {
            console.error("HTTP/2 session error", ex);
          }
        });
      })
      .on('request', async (req, res) => {
        if (this._checkIpBlockForHttp(req, res, "https/http1")) {
          return;
        }
        if (this._checkHostPolicyForHttp(req, res, "https/http1")) {
          return;
        }
        traceIncomingHttpRequest(req, req.httpVersion === "2.0" ? "http2" : "http1");
       
        if(req.httpVersion == "2.0"){
          // console.log("start http2 request", req.headers[":path"])
        // await this._checkCacheAsync(res, req.headers, async () => {
        //   const headers = req.headers
        //   /** @type {Request} */
        //   let cms = null;
        //   /** @type {BinaryContent[]} */
        //   const fileContents = [];
        //   /** @type {NodeJS.Dict<string>} */
        //   const jsonHeaders = {};
        //   /** @type {NodeJS.Dict<string>} */
        //   let formFields = {};
        //   const method = headers[":method"];
        //   const reqUrl = headers[":path"];
        //   let bodyStr = "";

        //   const createCmsAndCreateResponseAsync = async () => {
        //     try{
        //     const { query: queryObj } = url.parse(reqUrl, true);
        //     let debugCondition =
        //       queryObj.debug == "true" ||
        //       queryObj.debug == "1" ||
        //       queryObj.debug == "2";
        //     let rawRequest = debugCondition
        //       ? this.addStringTable("Raw Request", JSON.stringify(headers))
        //       : null;
        //     let routingDataStep = debugCondition
        //       ? new LightgDebugStep(null, "Get Routing Data")
        //       : null;
        //     cms = await this._createCmsObjectAsync(
        //       reqUrl.replace(/[\n\r]|%0a|%0d/gi, " "),
        //       method,
        //       headers,
        //       formFields,
        //       jsonHeaders,
        //       res.socket,
        //       bodyStr,
        //       true
        //     );
        //     const result = await this._service.processAsync(cms, fileContents);

        //     if (routingDataStep) routingDataStep.complete();
        //     const [code, headerList, body] = await result.getResultAsync(
        //       routingDataStep,
        //       rawRequest,
        //       debugCondition ? cms.dict : undefined
        //     );
        //     await this.addCacheContentAsync(
        //       `${headers.host}${headers[":path"]}`,
        //       body,
        //       headerList,
        //       headers[":method"]
        //     );
        //     res.writeHead(code,{
        //       ...headerList,
        //       "Strict-Transport-Security":
        //         "max-age=15552000; includeSubDomains; preload",
        //       "X-Content-Type-Options": "nosniff",
        //       "X-XSS-Protection": "1; mode=block",
        //     })
        //     res.end(body);
        //   }catch (ex){
        //     //console.error("qam error");
        //      console.error("error in process http2 request",ex);
        //   }
        //   };

        //   res.on("data", (chunk) => {
        //     if (
        //       headers["content-type"] === "application/json" ||
        //       headers["content-type"] == "application/javascript" ||
        //       headers["content-type"].startsWith(
        //         "application/x-www-form-urlencoded"
        //       )
        //     ) {
        //       bodyStr += chunk;
        //     }
        //   });

        //   res.on("end", async () => {
        //     if (
        //       headers["content-type"]?.startsWith(
        //         "application/x-www-form-urlencoded"
        //       )
        //     ) {
        //       formFields = querystring.parse(bodyStr);
        //     }
        //     //console.log("end")
        //     await createCmsAndCreateResponseAsync();
        //   });

        //   res.on("error", (ex) => {
        //     if (ex.code != "ERR_STREAM_WRITE_AFTER_END") {
        //       console.error("HTTP/2 server stream error", ex);
        //     }
        //     res.destroy(ex);
        //   });

        //   try {
        //     if (headers["content-length"] && headers["content-type"]?.startsWith("multipart/form-data")) {
        //         /** @type {Array<BinaryContent>} */
        //         const bb = busboy({ headers: headers });
        //         bb.on("file", (name, file, info) => {
        //           const ContentParts = [];
        //           file.on("data", (x) => ContentParts.push(x));
        //           file.on("end", async () => {
        //             const content = new BinaryContent();
        //             content.url = `${headers["host"]}${reqUrl}`;
        //             content.mime = info.mimeType.toLowerCase();
        //             content.name = info.filename;
        //             content.payload = Buffer.concat(ContentParts);
        //             fileContents.push(content);
        //           });
        //         });
        //         bb.on("field", (name, val, info) => {
        //           formFields[name] = val;
        //           if (name.startsWith("_")) {
        //             jsonHeaders[name] = val;
        //           }
        //         });
        //         bb.on("close", createCmsAndCreateResponseAsync);
        //         res.pipe(bb);
        //       } 
        //     else{
        //       //await createCmsAndCreateResponseAsync();
        //     }
        //   } catch (ex) {
        //     if (ex.code != "ERR_HTTP2_INVALID_STREAM") {
        //       console.error("HTTP/2 server error", ex);
        //       try {
        //         res.respond({
        //           ":status": StatusCodes.INTERNAL_SERVER_ERROR,
        //         });
        //       } catch (ex) {
        //         console.error("HTTP/2 server error", ex);
        //       }
        //       res.end(ex.toString());
        //     }
        //   }
        // });
        //console.log("end http2",req.headers[":path"])
        }else{
          const startedAt = Date.now();
          traceRequest("endpoint.h2.http1fallback.start", {
            protocol: "https/http1",
            method: req?.method || "",
            url: req?.url || "",
            host: req?.headers?.host || "",
          });
          // console.log("start http1 request",req.httpVersion,req.url)
           /** @type {Request} */
                  let cms = null;
                    await this._securityHeadersMiddleware(req, res, async () => {
                      if (this._handleCorsPreflight(req, res)) {
                        return;
                      }
                      await this._handleContentTypes(req, res, async () => {
                        await super._checkCacheAsync(req, res, async () => {
                          const createCmsAndCreateResponseAsync = async () => {
                            // console.log("qam",req.headers.host, req.url)
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
                              cms = await super._createCmsObjectAsync(
                                req.url,
                                req.method,
                                req.headers,
                                req.formFields,
                                req.jsonHeaders ? req.jsonHeaders : {},
                                req.socket,
                                req.bodyStr,
                                true
                              );
                              // console.log("body",req.bodyStr)
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
                            const [safeCode, safeHeaders, safeBody] =
                              this._prepareOutgoingResponse(
                                code,
                                headers,
                                body,
                                req.headers
                              );
                            res.writeHead(safeCode, safeHeaders);
                            res.end(safeBody);
                            traceRequest("endpoint.h2.http1fallback.response.sent", {
                              traceId: getRequestTraceId({ headers: req?.headers }),
                              method: req?.method || "",
                              url: req?.url || "",
                              statusCode: safeCode,
                              elapsedMs: Date.now() - startedAt,
                            });
                          };
                          try {
                            await createCmsAndCreateResponseAsync();
                          } catch (ex) {
                            traceError("endpoint.h2.http1fallback.error", ex, {
                              traceId: getRequestTraceId({ headers: req?.headers }),
                              method: req?.method || "",
                              url: req?.url || "",
                              elapsedMs: Date.now() - startedAt,
                            });
                            this._writeSafeInternalError(res, ex);
                          }
                        });
                      });
                    });
        }
        // Handle HTTP/1.1 requests (request/response-based)
        //res.writeHead(200, { 'Content-Type': 'text/plain' });
        // res.end('Hello, HTTP/1.1 fallback!');
      });

    return this._server;
  }

  async _checkCacheAsync(stream, headers, next) {
    const { query: queryObj } = url.parse(headers[":path"], true);
    const cacheKey = `${headers[HTTP2_HEADER_AUTHORITY]}${headers[":path"]}`;
    if (
      !queryObj.refresh &&
      this._cacheOptions &&
      this._cacheOptions.isEnabled &&
      this._cacheOptions.requestMethods.includes(headers[":method"]) &&
      this._cacheConnection
    ) {
      traceRequest("cache.lookup", {
        protocol: "http2",
        key: cacheKey,
        method: headers[":method"] || "",
      });
      const cacheOptions = await this._cacheConnection.loadContentAsync(
        cacheKey
      );
      if (cacheOptions) {
        traceRequest("cache.hit", {
          protocol: "http2",
          key: cacheKey,
          method: headers[":method"] || "",
        });
        try {
          stream.respond(
            this._withCommonResponseHeaders({
              ":status": 200,
              ...JSON.parse(this._cacheOptions.properties),
            })
          );
          stream.end(cacheOptions.file);
        } catch (err) {
          traceError("cache.http2.respond_error", err, {
            key: cacheKey,
          });
          next();
        }
      } else {
        traceRequest("cache.miss", {
          protocol: "http2",
          key: cacheKey,
          method: headers[":method"] || "",
        });
        next();
      }
    } else {
      traceRequest("cache.skip", {
        protocol: "http2",
        key: cacheKey,
        method: headers[":method"] || "",
      });
      next();
    }
  }
}
