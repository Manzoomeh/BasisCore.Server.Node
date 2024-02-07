import InMemoryMember from "./InMemoryMember.js";
import JsonSource from "../../../Source/JsonSource.js";
import IContext from "../../../Context/IContext.js";
import alasql from "alasql";
import ContextBase from "../../../Context/ContextBase.js";
export default class SqlMember extends InMemoryMember {
  /**
   * @param {object} memberIL
   */
  constructor(memberIL) {
    super(memberIL);
  }
  /**
   *
   * @param {IContext} context
   * @returns {JsonSource}
   */
  async _parseDataAsync(context) {
    //  try {
    const content = await this.rawContent.getValueAsync(context);
    const dataMemberNames = this.findDataMembersInContent(content);
    for (let dataMemberName of dataMemberNames) {
      const getSourceResult = await context.waitToGetSourceAsync(
        dataMemberName
      );
      const dataArray = getSourceResult.data;
      const sql = `CREATE TABLE [${dataMemberName}] (${Object.keys(dataArray[0])
        .map((key) => `${key} STRING`)
        .join(", ")})`;
      await alasql.promise(sql, [dataArray]);
      for (let data of dataArray) {
        await alasql.promise(
          `INSERT INTO [${dataMemberName}] VALUES (${
            "'" + Object.values(data).join("','") + "'"
          })`
        );
      }
    }

    const queryResult = await alasql.promise(content);
    console.log(queryResult);
    return new JsonSource(queryResult, this.name);
    // } catch (err) {
    //   console.log(err);
    // }
  }
  /**
   *
   * @param {string} text
   * @returns {Array}
   */
  findDataMembersInContent(text) {
    const dataMemberNames = [];
    let startIndex = -1;
    let endIndex = -1;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "[") {
        startIndex = i + 1;
      } else if (text[i] === "]" && startIndex !== -1) {
        endIndex = i;
        dataMemberNames.push(text.substring(startIndex, endIndex));
        startIndex = -1;
        endIndex = -1;
      }
    }
    return dataMemberNames;
  }
  /**
   *
   * @param {Array} dataMemberNames
   * @param {ContextBase} context
   */
}
