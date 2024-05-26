import net from "net";
import HostService from "./hostService.js";
import EdgeMessage from "../edge/edgeMessage.js";
import Request from "../models/request.js";
import { log } from "console";

export default class EdgeProxyHostService extends HostService {
  /**@type {string} */
  #ip;
  /**@type {number} */
  #port;
  /**
   * @param {string} name
   * @param {string} ip
   * @param {number} port
   * @param {HostServiceOptions} options
   */
  constructor(name, ip, port, options) {
    super(name, options);
    this.#ip = ip;
    this.#port = port;
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async processAsync(request, fileContents,logger) {
    await this._processUploadAsync(fileContents, request);
    /** @type {Promise<Request>} */
    const task = new Promise((resolve, reject) => {
      const buffer = [];
      const client = new net.Socket()
        .on("data", (data) => buffer.push(data))
        .on("close", function () {
          const data = Buffer.concat(buffer);
          try {
            const msg = EdgeMessage.createFromBuffer(data);
            resolve(JSON.parse(msg.payload));
          } catch (e) {
            logger.log({
              level: 'error',
              message: e.message
            })
            reject(e);
          }
        })
        .on("error", (e) => {
          logger.log({
            level: 'error',
            message: e.message
          })
          console.error(e);
          reject(e);
        })
        .connect(this.#port, this.#ip, () => {
          const msg = EdgeMessage.createAdHocMessageFromObject({
            cms: request,
          });
          msg.writeTo(client);
        });
    });
    const result = await task;
    return this._createResponse(result);
  }
}
