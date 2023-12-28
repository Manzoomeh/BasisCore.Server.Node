import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import IDataSource from "../../renderEngine/Source/IDataSource.js";
import Request from "../request.js";
import ILoadPageResult from "./ILoadPageResult.js";

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
}
