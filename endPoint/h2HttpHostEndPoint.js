import http2 from "http2";
import busboy from "busboy";
import { StatusCodes } from "http-status-codes";
import SecureHttpHostEndPoint from "./secureHttpHostEndPoint.js";
import HostService from "../services/hostService.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";

import http from "http";
export default class H2HttpHostEndPoint extends SecureHttpHostEndPoint {
  /** @type {HostService} */
  #service;

  /** @type {import("tls").SecureContextOptions} */
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
        const jsonHeaders = {};
        /**@type {NodeJS.Dict<string>} */
        const formFields = {};
        const method = headers[":method"];
        const url = headers[":path"];
        const createCmsAndCreateResponseAsync = async () => {
          cms = await this._createCmsObjectAsync(
            url,
            method,
            headers,
            formFields,
            jsonHeaders,
            stream.session.socket
          );
          const result = await this.#service.processAsync(cms, fileContents);
          const [code, headerList, body] = await result.getResultAsync();
          headerList[":status"] = code;
          stream.respond(headerList);
          stream.end(body);
        };
        stream.on("error", (ex) => {
          if (ex.code != "ERR_STREAM_WRITE_AFTER_END") {
            console.error("HTTP/2 server stream error", ex);
          }
          stream.destroy(ex);
        });
        try {
          if (method === "POST") {
            /**@type {Array<BinaryContent>}*/
            const bb = busboy({ headers: headers });
            bb.on("file", (name, file, info) => {
              const ContentParts = [];
              file.on("data", (x) => ContentParts.push(x));
              file.on("end", async () => {
                const content = new BinaryContent();
                content.url = `${headers["host"]}${url}`;
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
            createCmsAndCreateResponseAsync();
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
