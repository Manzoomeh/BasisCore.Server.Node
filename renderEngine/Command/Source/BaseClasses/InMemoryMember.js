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
    if (source instanceof Error) {
      throw source;
    }
    if (!source || !("data" in source)) {
      throw new Error(
        `Member '${sourceSchemaName}.${this.name}' did not produce a valid data source.`
      );
    }
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
    return retVal.addAttributeIfExist("format", this.format);
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
      const params = Array.isArray(data) ? data : [];
      if (String(sql || "").includes("?") && params.some((item) => item == null)) {
        reject(
          new Error(
            `AlaSQL query received undefined data source. sql=${String(sql || "").slice(
              0,
              500
            )}`
          )
        );
        return;
      }
      try {
        db.exec(sql, params, (result, err) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
