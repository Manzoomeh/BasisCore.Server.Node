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
    throw new Error("Method not implemented.");
  }
  /**
   * @param {string} sourceId
   * @returns {Promise<IDataSource>}
   */
  waitToGetSourceAsync(sourceId) {
    throw new Error("Method not implemented.");
  }
  /**
   * @param {string} connectionName
   * @returns {Promise<boolean>} */
  checkConnectionAsync(connectionName) {
    //TODO: must complete
    throw new Error("Method not implemented.");
  }

  /**
   * @param {string} sourceName
   * @param {string} connectionName
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @returns {Promise<DataSourceCollection>}
   */
  loadDataAsync(sourceName, connectionName, parameters) {}
}
