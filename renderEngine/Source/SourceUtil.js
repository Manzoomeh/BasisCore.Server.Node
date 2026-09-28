import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const alasql = require("alasql")
import StringUtil from "../Token/StringUtil.js";

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceOutsideQuotedStrings(input, replaceSegment) {
  let result = "";
  let segment = "";
  let quote = null;
  let escaped = false;

  for (const char of String(input || "")) {
    if (quote) {
      result += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      result += replaceSegment(segment);
      segment = "";
      quote = char;
      result += char;
      continue;
    }

    segment += char;
  }

  return result + replaceSegment(segment);
}

alasql.fn.REVERSE = function (str) {
  return str ?str.split("").reverse().join(""): null;
};

alasql.fn.reverse = function (str) {
  return str ?str.split("").reverse().join(""): null;
};
alasql.fn.CHARINDEX = function(substring, string) {
  return string ?string.indexOf(substring) + 1 : -1; 
};
alasql.fn.charindex = function(substring, string) {
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
alasql.fn.cast = function(value, type) {
  switch (type.toLowerCase()) {
      case 'int':
          return parseInt(value, 10);
      case 'float':
          return parseFloat(value);
      case 'string':
          return String(value);
      case 'boolean':
          return Boolean(value);
      default:
          return value; 
  }
}
alasql.fn.max = function(arr) {
  return Math.max.apply(null, arr);
};
alasql.fn.min = function(arr) {
  return Math.min.apply(null, arr);
};

export default class SourceUtil {
  static ensureDataArray(source, usage = "source operation") {
    if (source instanceof Error) {
      throw source;
    }
    if (!source) {
      throw new Error(`Cannot ${usage}: source is not available.`);
    }
    if (source.data == null) {
      console.warn("source data was empty before operation", {
        sourceId: source.id || "",
        usage,
        sourceType: source.constructor?.name || typeof source,
      });
      source.data = [];
    }
    if (!Array.isArray(source.data)) {
      source.data = [source.data];
    }
    return source.data;
  }

  static runQuery(sql, params, meta) {
    try {
      return alasql(sql, params);
    } catch (error) {
      console.error("alasql query failed", {
        ...meta,
        sql: String(sql || "").slice(0, 500),
        params: Array.isArray(params)
          ? params.map((item) => ({
              isArray: Array.isArray(item),
              length: Array.isArray(item) ? item.length : undefined,
              type: item == null ? String(item) : typeof item,
            }))
          : typeof params,
        error: String(error?.message || error || ""),
      });
      throw error;
    }
  }

  static buildDataSourceParams(sql, rows) {
    const sourceCount = (String(sql || "").match(/\?/g) || []).length;
    return Array.from({ length: Math.max(sourceCount, 1) }, () => rows);
  }

  static normalizeLegacyPostSql(sql) {
    return String(sql || "").replace(
      /trim\s*\(\s*([A-Za-z0-9_.[\]`"]+)\s*\)\s+is\s+(not\s+)?null/gi,
      (_, column, notKeyword = "") => `${column} is ${notKeyword || ""}null`
    );
  }

  static normalizeQuotedAliases(sql) {
    // AlaSQL treats quoted aliases as string values in some legacy queries
    // and exposes `AS 'result'` under the key "'result'". Brackets preserve
    // the intended column name for both single and double quotes.
    return String(sql || "").replace(
      /\bas\s+(["'])([A-Za-z_][A-Za-z0-9_]*)\1/gi,
      "AS [$2]"
    );
  }

  static escapeReservedColumnNames(source, sql) {
    if (!source?.columns?.length || !sql) {
      return sql;
    }
    // Alasql treats bare VALUE/PATH as special tokens. JSON members also expose
    // real "Value" and "Path" columns, so postsql must address them explicitly.
    const reservedColumns = source.columns.filter(
      (column) => ["value", "path"].includes(String(column).toLowerCase())
    );
    sql = replaceOutsideQuotedStrings(sql, (segment) => {
      reservedColumns.forEach((column) => {
        const escapedColumn = escapeRegExp(column);
        segment = String(segment).replace(
          new RegExp(`(^|[^\\w.\\[\\]\`"'])(${escapedColumn})(?![\\w\\]\`"'])`, "gi"),
          `$1[${column}]`
        );
      });
      return segment;
    });
    return sql;
  }

  static normalizeJsonMemberTypeLiterals(sql) {
    const typeMap = new Map(
      [
        "array",
        "object",
        "scalar.boolean",
        "scalar.null",
        "scalar.numeric",
        "scalar.string",
      ].map((value) => [
        value,
        value
          .split(".")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("."),
      ])
    );
    return String(sql || "").replace(
      /(\bType\b\s*(?:=|==|<>|!=)\s*)(['"])(array|object|scalar\.(?:boolean|null|numeric|string))\2/gi,
      (_, prefix, quote, value) => `${prefix}${quote}${typeMap.get(value.toLowerCase())}${quote}`
    );
  }

  /**
   *
   * @param {IDataSource} source
   * @param {string} sql
   */
  static applySql(source, sql) {
    // sql = sql.toLowerCase()
    // console.log(source,sql)
    const rows = SourceUtil.ensureDataArray(source, "apply postsql");
    sql = SourceUtil.normalizeLegacyPostSql(sql);
    sql = SourceUtil.normalizeQuotedAliases(sql);
    sql=SourceUtil.getExactColumnName(source,sql)
    sql = SourceUtil.escapeReservedColumnNames(source, sql);
    sql = SourceUtil.normalizeJsonMemberTypeLiterals(sql);
    const query = StringUtil.replace(
      StringUtil.replace(sql, `(\\[${source.id}\\])`, "?"),
      `(${source.id}),"?"`
    );
    const params = SourceUtil.buildDataSourceParams(query, rows);
    source.data = SourceUtil.runQuery(
      query,
      params,
      {
        sourceId: source.id || "",
        operation: "postsql",
        rowCount: rows.length,
        paramCount: params.length,
      }
    );
    // console.log("rtt",source)
  }

  /**
   * fix mis-match camel case a column name or over a query
   * @param {IDataSource} source
   * @param {string} columnOrQuery
   * @returns {string}
   */
  static getExactColumnName(source, columnOrQuery) {
    return replaceOutsideQuotedStrings(columnOrQuery, (segment) => {
      source.columns.forEach((col) => {
        const escapedColumn = escapeRegExp(col);
        segment = String(segment).replace(
          new RegExp(`(^|[^\\w.\\[\\]\`"'])(${escapedColumn})(?![\\w\\]\`"'])`, "gi"),
          `$1${col}`
        );
      });
      return segment;
    });
  }

  /**
   * @param {IDataSource} source
   * @param {string} sort
   */
  static applySort(source, sort) {
    const rows = SourceUtil.ensureDataArray(source, "apply sort");
    const result = SourceUtil.runQuery(`SELECT * from ? order by ${sort}`, [rows], {
      sourceId: source.id || "",
      operation: "sort",
      rowCount: rows.length,
    });
    source.data = result;
  }

  /**
   * @param {IDataSource} source
   */
  static addRowNumber(source) {
    const rows = SourceUtil.ensureDataArray(source, "add row number");
    let index = 1;
    if (Array.isArray(rows)) {
      rows.forEach((row) => {
        if (!row || typeof row !== "object") {
          return;
        }
        row["RowNumber"] = index++;
      });
    } else {
      rows["RowNumber"] = index;
      source.data = [rows];
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
    if (source instanceof Error) {
      throw source;
    }
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
