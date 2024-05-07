import net from "net";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import SocketSettingData from "./SocketSettingData.js";

/**
 * @typedef {Object} LoadDataRequest
 * @property {string} dmnid --domainID
 * @property {string} command --the basis core command
 * @property {NodeJS.Dict<string>} params -- other parameters
 */
export default class SocketConnectionInfo extends ConnectionInfo {
  /**@type {string} */
  host;
  /**@type {string} */
  port;
  /**
   * @param {string} name
   * @param {SocketSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    [this.host, this.port] = settings.endPoint.split(":");
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    const byteMessage = parameters.hasOwnProperty("byteMessage")
      ? parameters["byteMessage"]
      : null;
    const mySocket = new net.Socket();

    await new Promise((resolve, reject) => {
      mySocket.connect(
        {
          host: this.host,
          port: this.port,
        },
        () => {
          resolve();
        }
      );
      mySocket.on("error", (err) => {
        reject(err);
      });
    });
    const networkStream = mySocket;
    if (byteMessage) {
      await new Promise((resolve, reject) => {
        networkStream.write(byteMessage, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
    let result = await new Promise((resolve, reject) => {
      /** @type {Buffer[]}*/
      const buffer = [];
      networkStream.on("data", (data) => buffer.push(data));
      networkStream.on("error", (err) => {
        reject(err);
      });
      networkStream.on("end", () => {
        const data = Buffer.concat(buffer);
        const retVal = data.toString()
        resolve( new DataSourceCollection([[{ result: retVal }]]));
      });
    });
    return result;
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
}
