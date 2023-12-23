import { MongoClient } from "mongodb";
import net from "net";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "./../request.js";
import IMongoSettingData from "./IMongoSettingData.js";
import MongoMessage from "../../Mongo/MongoMessage.js";

export default class MongoConnectionInfo extends ConnectionInfo {
  /** @type {IMongoSettingData} */
  settings;

  /**
   * @param {string} name
   * @param {IMongoSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    this.settings = settings;
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    try {
      const client = new MongoClient(this.settings.endpoint);
      await client.connect();
    } finally {
      await client.close();
    }
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IDataSource>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    const task = new Promise((resolve, reject) => {
      const buffer = [];
      const client = new net.Socket()
        .on("data", (data) => buffer.push(data))
        .on("close", function () {
          const data = Buffer.concat(buffer);
          try {
            const msg = MongoMessage.createFromBuffer(data);
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
          const msg = MongoMessage.createAdHocMessageFromObject({
            cms: request,
          });
          msg.writeTo(client);
        });
    });
    const result = await task;
    //TODO: must edit in Mongo side
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
   * @returns {Promise<Response>}
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
            const msg = MongoMessage.createFromBuffer(data);
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
          const msg = MongoMessage.createAdHocMessageFromObject({
            cms: request,
          });
          msg.writeTo(client);
        });
    });
    const result = await task;
    return this._createResponse(result);
  }
}
