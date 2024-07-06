import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import IRoutingRequest from "../IRoutingRequest.js";
import Request from "../request.js";
import ILoadPageResult from "./ILoadPageResult.js";
import CacheResult from "../options/CacheResult.js";
export default class ConnectionInfo {
  /** @type {string} */
  name;

  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * @returns {Promise<boolean>}
   */
  testConnectionAsync() {
    return Promise.resolve(true);
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  loadDataAsync(parameters, cancellationToken) {
    throw new Error("ConnectionInfo.loadDataAsync() method not implemented.");
  }

  /**
   * @param {Request} httpRequest
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IRoutingRequest>}
   */
  getRoutingDataAsync(httpRequest, cancellationToken) {
    throw new Error(`routing not support in  ${this.name}!`);
  }

  /**
   * @param {string} pageName
   * @param {string} rawCommand
   * @param {number} pageSize
   * @param {number} domainId
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<ILoadPageResult>}
   */
  loadPageAsync(pageName, rawCommand, pageSize, domainId, cancellationToken) {
    throw new Error("ConnectionInfo.loadPageAsync() method not implemented.");
  }
  /**
   *
   * @param {string} jsonString
   * @returns {DataSourceCollection}
   */
  convertJSONToDataSet(content) {
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
  /**
   *
   * @param {string} key
   * @returns {Promise<CacheResult|null>}
   */
  async loadContentAsync(key) {}

  /**
   * @param {string} key
   * @param {string} content
   * @param {NodeJS.Dict<string>} properties
   * @returns {Promise<void>}
   */
  async addCacheContentAsync(key, content, properties) {}
  
  /** @returns {Promise<void>} */
  async deleteAllCache() {}
}
