import net from "net";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import IEdgeSettingData from "./IEdgeSettingData.js";
import EdgeMessage from "../../edge/edgeMessage.js";
import WebServerException from "../Exceptions/WebServerException.js";
import FormData from "form-data";

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
      const form = new FormData();
      form.append("dmnid", parameters.dmnid),
        form.append("command", parameters.command);
      const response = await fetch("http://" + this.settings.endpoint, {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      });
      return this.convertJSONToDataSet(await response.json());
    } catch (error) {
      throw new WebServerException(
        "Invalid api url or The result of the api is not a valid JSON ! + " +
          error
      );
    }
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IRoutingRequest>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
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
            reject(e);
          }
        })
        .on("error", (e) => {
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
            reject(e);
          }
        })
        .on("error", (e) => {
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
   * @param {string} jsonString
   * @returns {DataSourceCollection}
   */
  convertJSONToDataSet(jsonString) {
    let content = JSON.parse(jsonString);
    if (content?.sources && Array.isArray(content?.sources)) {
      let retVal = [];
      content.sources.forEach((source) => {
        retVal.push(source.data);
      });
      return new DataSourceCollection(retVal);
    } else {
      throw new WebServerException(
        "Error from Edge Connection ;the sources are not available."
      );
    }
  }
}
