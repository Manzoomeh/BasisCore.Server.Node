import CancellationToken from "../Cancellation/CancellationToken";
import IDataSource from "../Source/IDataSource";

export default class IContext {
  /**@type {boolean} */
  isSecure;
  /**@type {string} */
  domainId;
  /**@type {CancellationToken} */
  cancellation;
  /**
   * @param {string} dataSourceId
   * @returns {IDataSource}
   */
  tryGetDataSource(dataSourceId) {
    throw new Error("Method not implemented.");
  }
  /**
   * @param {string} dataSourceId
   * @returns {Promise<IDataSource>}
   */
  waitToGetDataSourceAsync(dataSourceId) {
    throw new Error("Method not implemented.");
  }
  /**
   * @param {string} connectionName
   * @returns {Promise<boolean>} */
  checkConnectionAsync(connectionName) {
    //TODO: must complete
    throw new Error("Method not implemented.");
  }
}
