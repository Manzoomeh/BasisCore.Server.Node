import IDataSource from "../Source/IDataSource.js";
import IContext from "./IContext.js";
import SourceRepository from "./SourceRepository.js";
import FunctionRepository from "./FunctionRepository.js";
export default class ContextBase extends IContext {
  /** @type {SourceRepository} */
  repository = new SourceRepository();
  functions = new FunctionRepository();
  /** @param {IDataSource} dataSource */
  addSource(dataSource) {
    this.repository.addSource(dataSource);
  }
  /**
   *
   * @param {string} key
   * @param {Function} userFunction
   * @returns void
   */
  addFunction(key, userFunction) {
    return this.functions.addFunction(key, userFunction);
  }

  /**
   * @param {string} key
   * @param {any[]} rest
   * @returns any
   */
  executeFunction(key, ...rest) {
    return this.functions.executeFunction(key, ...rest);
  }
  /**
   * @param {string} sourceId
   * @returns {IDataSource?}
   */
  tryGetSource(sourceId) {
    return this.repository.tryToGet(sourceId);
  }

  /**
   * @param {string} sourceId
   * @returns {Promise<IDataSource>}
   */
  waitToGetSourceAsync(sourceId) {
    return this.repository.waitToGetAsync(sourceId);
  }

  /**
   * @param {string} sourceName
   * @param {string} connectionName
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @returns {Promise<DataSourceCollection>}
   */
  loadDataAsync(sourceName, connectionName, parameters) {}
}
