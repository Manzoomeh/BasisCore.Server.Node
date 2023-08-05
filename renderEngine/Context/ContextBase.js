import IDataSource from "../Source/IDataSource.js";
import IContext from "./IContext.js";
import SourceRepository from "./SourceRepository.js";

export default class ContextBase extends IContext {
  /** @type {SourceRepository} */
  repository = new SourceRepository();

  /** @param {IDataSource} dataSource */
  addSource(dataSource) {
    this.repository.addSource(dataSource);
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
}
