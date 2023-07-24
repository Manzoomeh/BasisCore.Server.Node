import Util from "../../Util";
import IToken from "./IToken";
import SimpleTokenElement from "./SimpleTokenElement";

export default class ObjectToken extends IToken {
  /** @type {Array<SimpleTokenElement>} */
  params;

  constructor() {
    super();
  }

  /**
   * @param {IContext} context
   * @returns {Promise<string>}
   */
  async getValueAsync(context) {
    let retVal = null;
    for (let i = 0; i < this.params.length; i++) {
      const isLastItem = this.params.length == i + 1;
      const item = this.params[i];
      if (item.Value) {
        retVal = item.Value;
        break;
      } else {
        if (item.Member) {
          const dataMember = `${item.Source}.${item.Member}`;
          let dataSource = context.tryGetDataSource(dataMember);
          if (dataSource == null) {
            if (isLastItem) {
              if (dataMember.startsWith("cms.")) {
                break;
              }
              //Only Wait For Last Item in List
              dataSource = await context.waitToGetDataSourceAsync(dataMember);
              context.cancellation.throwIfCancellationRequested();
            } else {
              continue;
            }
          }
          const columnName = item.Column ?? dataSource.Columns[0];
          if (!dataSource.Columns.includes(columnName)) {
            if (isLastItem) {
              break;
            } else {
              continue;
            }
          }
          if (dataSource.Data.length == 1) {
            const columnRawValue = dataSource.Data[0][columnName];
            const columnValue = Util.toString(columnRawValue);
            if (Util.isNullOrEmpty(columnRawValue)) {
              //if value in source is null or blank,process next source
              if (!isLastItem) {
                continue;
              }
            } else {
              retVal = columnValue;
              break;
            }
          } else if (dataSource.Data.length > 1) {
            try {
              retVal = dataSource.Data.map((x) => {
                const columnValue = x[columnName];
                return typeof columnValue === "string"
                  ? `'${columnValue}'`
                  : Util.toString(columnValue);
              }).join(",");
            } catch {
              /*Nothing*/
            }
          }
        } else {
          if (!Util.isNullOrEmpty(item.Source)) {
            const isOk = await context.checkConnectionAsync(item.Source);
            retVal = isOk.toString();
          }
        }
      }
    }
    return retVal;
  }
}
