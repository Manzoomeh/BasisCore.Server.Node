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
    try {
      const db = new alasql.Database();
      const content = await this.rawContent.getValueAsync(context);
      const dataMemberNames = this.findDataMembersInContent(content);
      const getSourcePromises = dataMemberNames.map((dataMemberName) =>
        context.waitToGetSourceAsync(dataMemberName)
      );
      const sources = await Promise.all(getSourcePromises);
      const insertPromises = sources.map(async (source, index) => {
        const dataArray = source.data;
        const dataMemberName = dataMemberNames[index];
        const createTableSql = `CREATE TABLE [${dataMemberName}] (${Object.keys(
          dataArray[0]
        )
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
      });
      await Promise.all(insertPromises);
      const queryResult = await this.executeQueryAsync(db, content);
      db = null;
      return new JsonSource(queryResult, this.name);
    } catch (err) {
      console.log(err);
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
  /**
   *
   * @param {alasql.Database} db
   * @param {string} sql
   * @returns {Promise<NodeJS.Dict|undefined>}
   */
  executeQueryAsync(db, sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, [], (result, err) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}
