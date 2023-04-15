import http2 from "http2";
import { StatusCodes } from "http-status-codes";
import SecureHttpHostEndPoint from "./SecureHttpHostEndPoint.js";
import HostService from "../services/hostService.js";
import SecureContextOptions from "tls";

export default class H2HttpHostEndPoint extends SecureHttpHostEndPoint {
  /** @type {HostService} */
  #service;

  /** @type {SecureContextOptions} */
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

  /**
   * @param {string} urlStr
   * @param {string} method
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @param {NodeJS.Dict<string>[]} formFields
   * @param {BinaryContent[]} fileContents
   * @param {Socket} socket
   * @returns {Promise<RequestCms>}
   */
  async _createCmsObjectAsync(
    urlStr,
    method,
    requestHeaders,
    formFields,
    fileContents,
    socket
  ) {
    const cms = await super._createCmsObjectAsync(
      urlStr,
      method,
      requestHeaders,
      formFields,
      fileContents,
      socket
    );
    cms.request[
      "full-url"
    ] = `${requestHeaders[":authority"]}${requestHeaders[":path"]}`;
    return cms;
  }

  _createServer() {
    return http2
      .createSecureServer(this.#options)
      .on("stream", async (stream, headers) => {
        /** @type {Request} */
        let cms = null;
        /**@type {BinaryContent[]} */
        const fileContents = [];
        /**@type {NodeJS.Dict<string>} */
        const formFields = {};
        stream.on("error", (ex) => {
          if (ex.code != "ERR_STREAM_WRITE_AFTER_END") {
            console.error("HTTP/2 server stream error", ex);
          }
          stream.destroy(ex);
        });
        try {
          cms = await this._createCmsObjectAsync(
            headers[":path"],
            headers[":method"],
            headers,
            formFields,
            fileContents,
            stream.session.socket
          );
          const result = await this.#service.processAsync(cms);
          const [code, headerList, body] = await result.getResultAsync();
          headerList[":status"] = code;
          stream.respond(headerList);
          stream.end(body);
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
  }
}
