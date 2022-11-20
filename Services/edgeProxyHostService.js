import net from "net";
import HostService from "./hostService.js";
import EdgeMessage from "../edge/edgeMessage.js";
import Request from "../models/request.js";
import { on } from "events";

export default class EdgeProxyHostService extends HostService {
  /**@type {string} */
  #ip;
  /**@type {number} */
  #port;
  /**
   * @param {string} name
   * @param {number} ip
   * @param {string} port
   */
  constructor(name, ip, port) {
    super(name);
    this.#ip = ip;
    this.#port = port;
  }

  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async processAsync(request) {
    /** @type {Promise<Request>} */
    const task = new Promise((resolve, reject) => {
      var buffer = [];
      const client = new net.Socket()
        .on("data", (data) => buffer.push(data))
        .on("close", function () {
          const data = Buffer.concat(buffer);
          try {
            var msg = EdgeMessage.createFromBuffer(data);
            resolve(JSON.parse(msg.payload));
          } catch (e) {
            reject(e);
          }
        })
        .on("error", (e) => {
          reject(e);
          console.error(e);
        })
        .connect(this.#port, this.#ip, () => {
          const msg = EdgeMessage.createAdHocMessageFromObject({
            cms: request,
          });
          msg.writeTo(client);
        });
    });
    var result = await task;
    return this._createResponse(result);
  }
}
