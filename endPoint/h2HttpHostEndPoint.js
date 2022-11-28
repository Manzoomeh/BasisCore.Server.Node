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
   * @param {Socket} socket
   * @returns {RequestCms}
   */
  _createCmsObject(urlStr, method, requestHeaders, socket) {
    const cms = super._createCmsObject(urlStr, method, requestHeaders, socket);
    cms.request[
      "full-url"
    ] = `${requestHeaders[":authority"]}${requestHeaders[":path"]}`;
    return cms;
  }

  _createServer() {
    return http2
      .createSecureServer(this.#options)
      .on("stream", async (stream, headers) => {
        stream.on("error", (e) => console.log(e));
        try {
          var cms = this._createCmsObject(
            headers[":path"],
            headers[":method"],
            headers,
            stream.session.socket
          );
          const result = await this.#service.processAsync(cms);
          const [code, headerList, body] = await result.getResultAsync();
          headerList[":status"] = code;
          stream.respond(headerList);
          stream.end(body);
        } catch (ex) {
          console.error(ex);
          if (ex.code != "ERR_HTTP2_INVALID_STREAM") {
            stream.respond({
              ":status": StatusCodes.INTERNAL_SERVER_ERROR,
            });
            stream.end(ex.toString());
          }
        }
      })
      .on("error", (er) => console.error(er))
      .on("sessionError", (er) => console.error(er))
      .on("unknownProtocol", (er) => console.error(er));
  }
}
