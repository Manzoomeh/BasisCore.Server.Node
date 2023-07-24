import IDataSource from "../Source/IDataSource";
import IContext from "./IContext";
import SourceRepository from "./SourceRepository";

export default class ContextBase extends IContext {
  /** @type {SourceRepository} */
  repository = {};

  /** @param {IDataSource} dataSource */
  addDataSource(dataSource) {
    this.repository.setSource(dataSource);
  }

  /**
   * @param {string} dataSourceId
   * @returns {IDataSource?}
   */
  tryGetDataSource(dataSourceId) {
    return this.sources.get(dataSourceId.toLowerCase()) ?? null;
  }

  /**
   * @param {string} dataSourceId
   * @returns {Promise<IDataSource>}
   */
  async waitToGetDataSourceAsync(dataSourceId) {
    const key = dataSourceId.toLowerCase();
    let retVal = this.tryGetDataSource(key);
    if (retVal == null) {
      retVal = await this.waitToGetDataSourceAsync(key);
    }
    return retVal;
  }
}
