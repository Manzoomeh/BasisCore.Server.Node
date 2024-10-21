import http2 from "http2";
import busboy from "busboy";
import { StatusCodes } from "http-status-codes";
import SecureHttpHostEndPoint from "./secureHttpHostEndPoint.js";
import HostService from "../services/hostService.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";
import http from "http";
import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";
import url from "url";
import CacheSettings from "../models/options/CacheSettings.js";
const { HTTP2_HEADER_AUTHORITY } = http2.constants;

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
    this.#options = options;
    this.#options.ciphers = [
      "TLS_AES_256_GCM_SHA384",
      "TLS_CHACHA20_POLY1305_SHA256",
      "TLS_AES_128_GCM_SHA256",
      "ECDHE-RSA-AES256-GCM-SHA384",
      "ECDHE-RSA-AES128-GCM-SHA256",
    ].join(":");
    this.#options.honorCipherOrder = true;
    this.#options.minVersion = "TLSv1.2";
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
    console.log(formFields,fileContents)
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

  _createServer() {
    this._server = http2
      .createSecureServer(this.#options)
      .on("stream", async (stream, headers) => {
        this._checkCacheAsync(stream, headers, async () => {
          /** @type {Request} */
          let cms = null;
          /** @type {BinaryContent[]} */
          const fileContents = [];
          /** @type {NodeJS.Dict<string>} */
          const jsonHeaders = {};
          /** @type {NodeJS.Dict<string>} */
          const formFields = {};
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
            const result = await this._service.processAsync(cms, fileContents);

            if (routingDataStep) routingDataStep.complete();
            const [code, headerList, body] = await result.getResultAsync(
              routingDataStep,
              rawRequest,
              debugCondition ? cms.dict : undefined
            );
            await this.addCacheContentAsync(
              `${headers.host}${headers[":path"]}`,
              body,
              headerList,
              headers[":method"]
            );
            headerList[":status"] = code;
            stream.respond({
              ...headerList,
              "Strict-Transport-Security":
                "max-age=15552000; includeSubDomains; preload",
              "X-Content-Type-Options": "nosniff",
              "X-Frame-Options": "DENY",
              "X-XSS-Protection": "1; mode=block",
            });
            stream.end(body);
          };

          stream.on("data", (chunk) => {
            if (headers["content-type"] === "application/json" || headers["content-type"]=="application/javascript"||headers["content-type"].startsWith("application/x-www-form-urlencoded")) {
              bodyStr += chunk;
            }
          });

          stream.on("end", async () => {
            await createCmsAndCreateResponseAsync();
          });

          stream.on("error", (ex) => {
            if (ex.code != "ERR_STREAM_WRITE_AFTER_END") {
              console.error("HTTP/2 server stream error", ex);
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
                  console.log(name,val)
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
              console.error("HTTP/2 server error", ex);
              try {
                stream.respond({
                  ":status": StatusCodes.INTERNAL_SERVER_ERROR,
                });
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
        /*console.error("HTTP/2 server sessionError", ex)*/
      })
      .on("unknownProtocol", (ex) => {
        /*console.error("HTTP/2 server unknownProtocol", ex)*/
      })
      .on("session", (session) => {
        session.on("error", (ex) => {
          if (ex?.code === "ECONNRESET") {
            console.warn("HTTP/2 session connection reset.");
          } else {
            console.error("HTTP/2 session error", ex);
          }
        });
      });
    return this._server;
  }

  async _checkCacheAsync(stream, headers, next) {
    const { query: queryObj } = url.parse(headers[":path"], true);
    if (
      !queryObj.refresh &&
      this._cacheOptions &&
      this._cacheOptions.isEnabled &&
      this._cacheOptions.requestMethods.includes(headers[":method"]) &&
      this._cacheConnection
    ) {
      const fullUrl = `${headers[HTTP2_HEADER_AUTHORITY]}${headers[":path"]}`;
      const cacheOptions = await this._cacheConnection.loadContentAsync(
        fullUrl
      );
      if (cacheOptions) {
        try {
          stream.respond({
            ":status": 200,
            ...JSON.parse(this._cacheOptions.properties),
          });
          stream.end(cacheOptions.content);
        } catch (err) {
          next();
        }
      } else {
        next();
      }
    } else {
      next();
    }
  }
}
