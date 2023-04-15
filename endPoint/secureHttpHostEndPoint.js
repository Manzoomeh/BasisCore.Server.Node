import https from "https";
import busboy from "busboy";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";

export default class SecureHttpHostEndPoint extends HttpHostEndPoint {
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

  _createServer() {
    return https
      .createServer(this.#options, async (req, res) => {
        /** @type {Request} */
        let cms = null;
        /**@type {BinaryContent[]} */
        const fileContents = [];
        /**@type {NodeJS.Dict<string>} */
        const formFields = {};
        const createCmsAndCreateResponseAsync = async () => {
          cms = await this._createCmsObjectAsync(
            req.url,
            req.method,
            req.headers,
            formFields,
            fileContents,
            req.socket
          );
          const result = await this.#service.processAsync(cms);
          const [code, headers, body] = await result.getResultAsync();
          res.writeHead(code, headers);
          res.end(body);
        };
        try {
          if (req.method === "POST") {
            /**@type {Array<BinaryContent>}*/
            const bb = busboy({ headers: req.headers });
            bb.on("file", (name, file, info) => {
              const ContentParts = [];
              file.on("data", (x) => ContentParts.push(x));
              file.on("end", async () => {
                const content = new BinaryContent();
                content.mime = info.mimeType.toLowerCase();
                content.name = info.filename;
                content.payload = Buffer.concat(ContentParts);
                fileContents.push(content);
              });
            });
            bb.on("field", (name, val, info) => {
              formFields[name] = val;
            });
            bb.on("close", createCmsAndCreateResponseAsync);
            req.pipe(bb);
          } else {
            createCmsAndCreateResponseAsync();
          }
        } catch (ex) {
          console.error(ex);
          res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
          res.end(ex.toString());
        }
      })
      .on("error", (er) => console.error(er))
      .on("clientError", (er) => console.error(er))
      .on("tlsClientError", (er) => console.error(er));
  }
}
