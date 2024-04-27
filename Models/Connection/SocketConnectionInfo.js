import net from "net";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import SocketSettingData from "./SocketSettingData.js";
import WebServerException from "../Exceptions/WebServerException.js";

/**
 * @typedef {Object} LoadDataRequest
 * @property {string} dmnid --domainID
 * @property {string} command --the basis core command
 * @property {NodeJS.Dict<string>} params -- other parameters
 */
export default class SocketConnectionInfo extends ConnectionInfo {
  /**@type {string} */
  endPoint;
  /**
   * @param {string} name
   * @param {SocketSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    this.endPoint = settings.endPoint;
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async LoadDataAsync(cancellationToken, parameters) {
    const retVal = await this.sendAsync(parameters);
    return this.convertJSONToDataSet(retVal);
  }
  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IRoutingRequest>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    const result = await this.loadDataAsync(request);
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
  async sendAsync(parameters) {
    const byteMessage = parameters.hasOwnProperty("byteMessage")
      ? parameters["byteMessage"]
      : null;
    const mySocket = new net.Socket();
    await new Promise((resolve, reject) => {
      mySocket.connect(this.EndPoint, () => {
        resolve();
      });
      mySocket.on("error", (err) => {
        reject(err);
      });
    });
    const networkStream = mySocket;
    await new Promise((resolve, reject) => {
      networkStream.write(byteMessage, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    return await new Promise((resolve, reject) => {
      networkStream.read((err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
