import alasql from './../../../../alasql-ex.js';

import InMemoryMember from "./InMemoryMember.js";
import JsonSource from "../../../Source/JsonSource.js";
import IContext from "../../../Context/IContext.js";
import BasisCoreException from "../../../../Models/Exceptions/BasisCoreException.js";
import SourceUtil from "../../../Source/SourceUtil.js";

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
    try {
      /** @type {lasql.Database} */
      let db = new alasql.Database();
      let content = await this.rawContent.getValueAsync(context);
      const dataMemberNames = this.findDataMembersInContent(content);
      const getSourcePromises = dataMemberNames.map((dataMemberName) =>
        context.waitToGetSourceAsync(dataMemberName)
      );
      const sources = await Promise.all(getSourcePromises);
      const insertPromises = sources.map(async (source, index) => {
        const dataArray = source.data;
        const dataMemberName = dataMemberNames[index];

        const createTableSql = `CREATE TABLE [${dataMemberName}] (${source.columns
          .map((key) => `${key} STRING`)
          .join(", ")})`;
        await this.executeQueryAsync(db, createTableSql);
        const insertPromises = dataArray.map((data) => {
          const insertSql = `INSERT INTO [${dataMemberName}] VALUES (${Object.values(
            data
          )
            .map((val) => `'${val}'`)
            .join(", ")})`;
          return this.executeQueryAsync(db, insertSql);
        });
        await Promise.all(insertPromises);
        content = SourceUtil.getExactColumnName(source, content);
      });
      await Promise.all(insertPromises);
      const queryResult = await this.executeQueryAsync(db, content);
      db = null;
      return new JsonSource(queryResult, this.name);
    } catch (err) {
      return new BasisCoreException("Error in run sql member: " + err);
    }
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
}
