import Util from "../../Util.js";
import IContext from "../Context/IContext.js";
import IToken from "./IToken.js";
import SimpleTokenElement from "./SimpleTokenElement.js";

export default class ObjectToken extends IToken {
  /** @type {Array<SimpleTokenElement>} */
  elements;

  /**
   *
   * @param {Array<SimpleTokenElement>} elements
   */
  constructor(elements) {
    super();
    this.elements = elements;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<string>}
   */
  async getValueAsync(context) {
    let retVal = null;
    for (let i = 0; i < this.elements.length; i++) {
      const isLastItem = this.elements.length == i + 1;
      const item = this.elements[i];
      if (item.value) {
        retVal = item.value;
        break;
      } else {
        if (item.member) {
          const dataMember = `${item.source}.${item.member}`;
          let dataSource = context.tryGetSource(dataMember);
          if (dataSource == null) {
            if (isLastItem) {
              if (dataMember.startsWith("cms.")) {
                break;
              }
              //Only Wait For Last Item in List
              dataSource = await context.waitToGetSourceAsync(dataMember);
              context.cancellation.throwIfCancellationRequested();
            } else {
              continue;
            }
          }
          const columnName = item.column ?? dataSource.Columns[0];
          if (!dataSource.columns.includes(columnName)) {
            if (isLastItem) {
              break;
            } else {
              continue;
            }
          }
          if (dataSource.data.length == 1) {
            const columnRawValue = dataSource.data[0][columnName];
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
          } else if (dataSource.data.length > 1) {
            try {
              retVal = dataSource.data
                .map((x) => {
                  const columnValue = x[columnName];
                  return typeof columnValue === "string"
                    ? `'${columnValue}'`
                    : Util.toString(columnValue);
                })
                .join(",");
            } catch {
              /*Nothing*/
            }
          }
        } else {
          if (!Util.isNullOrEmpty(item.source)) {
            const isOk = await context.checkConnectionAsync(item.source);
            retVal = isOk.toString();
          }
        }
      }
    }
    return retVal;
  }
}
