import CancellationToken from "../Cancellation/CancellationToken.js";
import CommandBase from "../Command/CommandBase.js";
import IDataSource from "../Source/IDataSource.js";

export default class IContext {
  /**@type {boolean} */
  isSecure;
  /**@type {string} */
  domainId;
  /**@type {CancellationToken} */
  cancellation;
  /**
   * @param {string} sourceId
   * @returns {IDataSource}
   */
  tryGetSource(sourceId) {
    throw new Error("Method 'tryGetSource' not implemented.");
  }
  /**
   * @param {string} sourceId
   * @returns {Promise<IDataSource>}
   */
  waitToGetSourceAsync(sourceId) {
    throw new Error("Method 'waitToGetSourceAsync' not implemented.");
  }

  /**
   * @param {string} connectionName
   * @returns {Promise<boolean>} */
  checkConnectionAsync(connectionName) {
    throw new Error("Method 'checkConnectionAsync' not implemented.");
  }

  /**
   * @param {string} sourceName
   * @param {string} connectionName
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @returns {Promise<DataSourceCollection>}
   */
  loadDataAsync(sourceName, connectionName, parameters) {
    throw new Error("Method 'loadDataAsync' not implemented.");
  }

  /** @param {IDataSource} dataSource */
  addSource(dataSource) {
    throw new Error("Method 'addSource' not implemented.");
  }

  /**
   * @param {string} key
   * @param {string?} defaultValue
   * @returns {string}
   */
  getDefault(key, defaultValue) {
    throw new Error("Method 'getDefault' not implemented.");
  }

  /**
   * @param {string} title
   * @returns {IContext}
   */
  createContext(title) {
    throw new Error("Method 'createContext' not implemented.");
  }

  /**
   * @param {string} pageName
   * @param {string} rawCommand
   * @param {string} pageSize
   * @param {number} callDepth
   * @return {Promise<CommandBase>}
   */
  loadPageAsync(pageName, rawCommand, pageSize, callDepth) {
    throw new Error("Method 'loadPageAsync' not implemented.");
  }
}
