import CancellationToken from "../Cancellation/CancellationToken.js";
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
    //TODO: must complete
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
   * @returns {string}
   */
  getDefault(key) {
    throw new Error("Method 'getDefault' not implemented.");
  }
}