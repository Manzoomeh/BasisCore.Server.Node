import net from "net";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import IEdgeSettingData from "./IEdgeSettingData.js";
import EdgeMessage from "../../edge/edgeMessage.js";
import WebServerException from "../Exceptions/WebServerException.js";
/**
 * @typedef {Object} LoadDataRequest
 * @property {string} dmnid --domainID
 * @property {string} command --the basis core command
 * @property {NodeJS.Dict<string>} params -- other parameters
 */
export default class EdgeConnectionInfo extends ConnectionInfo {
  /** @type {IEdgeSettingData} */
  settings;
  /** @type {string} */
  #ip;
  /** @type {number} */
  #port;

  /**
   * @param {string} name
   * @param {IEdgeSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    this.settings = settings;
    const parts = this.settings.endpoint.split(":");
    this.#ip = parts[0];
    this.#port = parseInt(parts[1]);
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    try {
      /**
       * @type LoadDataRequest
       */
      const loadDataRequest = {
        dmnid: parameters.dmnid,
        command: parameters.command,
        params: parameters.params ?? {},
      };
      const response = await this.sendAsync(loadDataRequest);
      return this.convertJSONToDataSet(response);
    } catch (error) {
      throw new WebServerException(error + "  " + this.settings.endpoint);
    }
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IRoutingRequest>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    const result = await this.sendAsync(request);
    //TODO: must edit in edge side
    if (result.cms.webserver) {
      result.webserver = result.cms.webserver;
      delete result.cms.webserver;
    }
    if (result.cms.http) {
      result.http = result.cms.http;
      delete result.cms.http;
    }
    return result;
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<RoutingRequest>}
   */
  async processAsync(request, fileContents) {
    await this._processUploadAsync(fileContents, request);
    /** @type {Promise<Request>} */
    const result = await this.sendAsync(request);
    return this._createResponse(result);
  }
  /**@returns {Promise<boolean>} */
  async testConnectionAsync() {
    return new Promise((resolve) => {
      const client = new net.Socket();
      client.on("error", (e) => {
        resolve(false);
      });
      client.connect(this.#port, this.#ip, () => {
        client.end();
        resolve(true);
      });
    });
  }
  /**
   *
   * @param {Request|LoadDataRequest} request
   * @returns {Promise<NodeJS.Dict<string>>}
   */
  sendAsync(request) {
    return new Promise((resolve, reject) => {
      const buffer = [];
      const client = new net.Socket()
        .on("data", (data) => buffer.push(data))
        .on("close", function () {
          const data = Buffer.concat(buffer);
          try {
            const msg = EdgeMessage.createFromBuffer(data);
            resolve(JSON.parse(msg.payload));
          } catch (e) {
            reject(e);
          }
        })
        .on("error", (e) => {
          console.error(e);
          reject(e);
        })
        .connect(this.#port, this.#ip, () => {
          let msg;
          if (request?.command) {
            msg = EdgeMessage.createAdHocMessageFromObject(request);
          } else {
            msg = EdgeMessage.createAdHocMessageFromObject({
              cms: request,
            });
          }
          msg.writeTo(client);
        });
    });
  }
}
