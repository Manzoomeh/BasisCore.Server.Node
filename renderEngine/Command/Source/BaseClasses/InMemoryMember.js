import IContext from "../../../Context/IContext.js";
import IDataSource from "../../../Source/IDataSource.js";
import Member from "./Member.js";

export default class InMemoryMember extends Member {
  /** @type {string} */
  format;
  /**
   * @param {object} memberIL
   */
  constructor(memberIL) {
    super(memberIL);
    this.format = memberIL["format"];
  }

  /**
   * @param {string} sourceSchemaName
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async addDataSourceAsync(sourceSchemaName, context) {
    var source = await this._parseDataAsync(context);
    if (source) {
      context.cancellation.throwIfCancellationRequested();
      await super.addDataSourceAsync(source, sourceSchemaName, context);
    }
  }

  /**
   * @param {IContext} context
   * @returns {Promise<IDataSource>}
   */
  _parseDataAsync(context) {
    throw new Error("executeCommandAsync not implemented");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const retVal = await super.createHtmlElementAsync(context);
    return retVal.addAttributeIfExistAsync("format", this.format, context);
  }
  /**
   *
   * @param {alasql.Database} db
   * @param {string} sql
   * @param {Array[]?} data
   * @returns {Promise<NodeJS.Dict|undefined>}
   */
  executeQueryAsync(db, sql, data) {
    return new Promise((resolve, reject) => {
      db.exec(sql, data, (result, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}
