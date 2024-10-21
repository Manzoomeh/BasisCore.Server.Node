import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const alasql = require ("./../../../alasql")
import IDataSource from "./IDataSource.js";
import IContext from "../Context/IContext.js";
import StringUtil from "../Token/StringUtil.js";

alasql.fn.REVERSE = function (str) {
  return str ?str.split("").reverse().join(""): null;
};
alasql.fn.CHARINDEX = function(substring, string) {
  return string ?string.indexOf(substring) + 1 : -1; 
};
alasql.fn.SUBSTR = function (str, start, length) {
  if (typeof str !== 'string') return null;
  start = start - 1;
  if (length !== undefined) {
    return str.substring(start, start + length);
  }
  return str.substring(start);
};
alasql.fn.INDEXOF = function (str, searchValue) {
  if (typeof str !== 'string' || typeof searchValue !== 'string') return -1; 
  var index = str ?str.indexOf(searchValue) : -1;
  return index >= 0 ? index + 1 : -1; 
};

export default class SourceUtil {
  /**
   *
   * @param {IDataSource} source
   * @param {string} sql
   */
  static applySql(source, sql) {
    source.data = alasql(
      StringUtil.replace(
        StringUtil.replace(sql, `(\\[${source.id}\\])`, "?"),
        `(${source.id}),"?"`
      ),
      [source.data]
    );
  }

  /**
   * fix mis-match camel case a column name or over a query
   * @param {IDataSource} source
   * @param {string} columnOrQuery
   * @returns {string}
   */
  static getExactColumnName(source, columnOrQuery) {
    source.columns.forEach((col) => {
      columnOrQuery = StringUtil.replace(columnOrQuery, col, col);
    });
    return columnOrQuery;
  }

  /**
   * @param {IDataSource} source
   * @param {string} sort
   */
  static applySort(source, sort) {
    const result = alasql(`SELECT * from ? order by ${sort}`, [source.data]);
    source.data = result;
  }

  /**
   * @param {IDataSource} source
   */
  static addRowNumber(source) {
    let index = 1;
    if (Array.isArray(source.data)) {
      source.data.forEach((row) => {
        row["RowNumber"] = index++;
      });
    } else {
      source.data["RowNumber"] = index;
      source.data = [source.data];
    }
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @param {boolean} preview
   * @param {string} sort
   * @param {string} postSql
   */
  static addToContext(source, context, preview, sort, postSql) {
    if (postSql) {
      SourceUtil.applySql(source, postSql);
    }
    if (sort) {
      SourceUtil.applySort(source, sort);
    }
    SourceUtil.addRowNumber(source);
    //TODO
    if (preview) {
    }
    context.addSource(source);
    context.debugContext.addDebugInformation(source.id, source.data);
  }
}
