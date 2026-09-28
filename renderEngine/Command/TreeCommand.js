import TokenUtil from "../Token/TokenUtil.js";
import RenderableCommand from "./RenderableCommand.js";
import RenderParam from "./RenderParam.js";
import FaceCollection from "./Renderable/FaceCollection.js";
import StringUtil from "../Token/StringUtil.js";
import Util from "../../Util.js";
import SourceUtil from "../Source/SourceUtil.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const alasql = require("alasql");

function normalizeTreeNullValue(rawValue, sampleValue) {
  if (
    rawValue === null ||
    (typeof rawValue === "string" && rawValue.trim().toLowerCase() === "null")
  ) {
    return null;
  }
  if (typeof sampleValue !== "number") {
    return rawValue;
  }
  const value = Number(rawValue);
  if (Number.isFinite(value)) {
    return value;
  }
  console.warn("tree null-value was not numeric; falling back to 0", {
    rawValue: rawValue == null ? String(rawValue) : rawValue,
    sampleValue,
  });
  return 0;
}

function getObjectKey(value, ...names) {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  for (const name of names) {
    if (Object.prototype.hasOwnProperty.call(value, name)) {
      return name;
    }
    const foundKey = Object.keys(value).find(
      (key) => key.toLowerCase() === name.toLowerCase()
    );
    if (foundKey) {
      return foundKey;
    }
  }
  return undefined;
}

function getObjectField(value, ...names) {
  const key = getObjectKey(value, ...names);
  return key ? value[key] : undefined;
}

function setObjectField(value, fieldValue, fallbackName, ...names) {
  if (!value || typeof value !== "object") {
    return;
  }
  const key = getObjectKey(value, ...names) || fallbackName;
  value[key] = fieldValue;
}

function setBasisObjectFields(row, fields) {
  if (!row || !fields || Object.keys(fields).length === 0) {
    return;
  }
  const mergedFields = {
    ...(row.__basisObjectFields || {}),
    ...fields,
  };
  const rawValue = getObjectField(row, "Value");
  if (
    rawValue &&
    typeof rawValue === "object" &&
    !Array.isArray(rawValue)
  ) {
    setObjectField(row, {
      ...mergedFields,
      ...rawValue,
    }, "Value", "value");
  }
  Object.defineProperty(row, "__basisObjectFields", {
    configurable: true,
    enumerable: true,
    value: mergedFields,
    writable: true,
  });
}

function attachScalarChildFields(row, childRows) {
  if (!row || !Array.isArray(childRows) || childRows.length === 0) {
    return;
  }
  const fields = {};
  childRows.forEach((child) => {
    const field = getObjectField(child, "Field");
    const type = getObjectField(child, "Type");
    if (
      field &&
      String(type || "").toLowerCase().startsWith("scalar.")
    ) {
      fields[field] = getObjectField(child, "Value");
    }
  });
  if (Object.keys(fields).length === 0) {
    return;
  }
  setBasisObjectFields(row, fields);
}

function attachScalarFieldsForAllRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return;
  }
  const fieldsByParentId = new Map();
  rows.forEach((row) => {
    const parentId = getObjectField(row, "ParentId", "parentid");
    const field = getObjectField(row, "Field");
    const type = getObjectField(row, "Type");
    if (
      parentId == null ||
      !field ||
      !String(type || "").toLowerCase().startsWith("scalar.")
    ) {
      return;
    }
    const parentFields = fieldsByParentId.get(parentId) || {};
    parentFields[field] = getObjectField(row, "Value");
    fieldsByParentId.set(parentId, parentFields);
  });
  rows.forEach((row) => {
    const fields = fieldsByParentId.get(getObjectField(row, "Id", "id"));
    if (fields) {
      setBasisObjectFields(row, fields);
    }
  });
}

export default class TreeCommand extends RenderableCommand {
  /** @type {IToken} */
  principalKey;
  /** @type {IToken} */
  foreignKey;
  /** @type {IToken} */
  nullValue;
  /** @type {IToken} */
  relationColumnName;
  /**
   * @param {object} treeCommandIl
   */
  constructor(treeCommandIl) {
    super(treeCommandIl);
    this.principalKey = TokenUtil.getFiled(treeCommandIl, "principal-key");
    this.foreignKey = TokenUtil.getFiled(treeCommandIl, "foreign-key");
    this.nullValue = TokenUtil.getFiled(treeCommandIl, "null-value");
    this.relationColumnName = TokenUtil.getFiled(
      treeCommandIl,
      "relation-column-name"
    );
  }
  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @param {FaceCollection?} faces,
   * @param {ReplaceCollection?} replaces ,
   * @param {number?} dividerRowCount ,
   * @param {string?} dividerTemplate ,
   * @param {string?} incompleteTemplate ,
   * @returns {Promise<string>}
   */
  async renderInternallyAsync(
    source,
    context,
    faces,
    replaces,
    dividerRowCount,
    dividerTemplate,
    incompleteTemplate
  ) {
    /** @type {string} */
    let retVal = null;
    const rows = SourceUtil.ensureDataArray(source, "render tree");
    if (rows.length > 0) {
      attachScalarFieldsForAllRows(rows);
      retVal = "";
      /** @type {Array<object>} */
      const processedRows = [];
      let [relationColumnName, foreignKey, principalKey, tempNullValue] =
        await Promise.all([
          await TokenUtil.getValueOrDefaultAsync(
            this.relationColumnName,
            context
          ),
          await TokenUtil.getValueOrDefaultAsync(
            this.foreignKey,
            context,
            "parentid"
          ),
          await TokenUtil.getValueOrDefaultAsync(
            this.principalKey,
            context,
            "id"
          ),
          await TokenUtil.getValueOrDefaultAsync(this.nullValue, context, "0"),
        ]);
      foreignKey = SourceUtil.getExactColumnName(source, foreignKey);
      principalKey = SourceUtil.getExactColumnName(source, principalKey);

      const nullValue = normalizeTreeNullValue(
        tempNullValue,
        rows[0][foreignKey]
      );

      const rootRecord =
        nullValue === null
          ? SourceUtil.runQuery(
              `SELECT VALUE FROM ? WHERE ${foreignKey} IS NULL`,
              [rows],
              {
                sourceId: source.id || "",
                operation: "tree-root-null",
                rowCount: rows.length,
              }
            )
          : SourceUtil.runQuery(
              `SELECT VALUE FROM ? WHERE ${foreignKey} = ?`,
              [rows, nullValue],
              {
                sourceId: source.id || "",
                operation: "tree-root",
                rowCount: rows.length,
              }
            );
      if (
        rootRecord.length === 0 &&
        nullValue === null &&
        rows.some((row) => row?.[foreignKey] === 0)
      ) {
        rootRecord.push(
          ...SourceUtil.runQuery(
            `SELECT VALUE FROM ? WHERE ${foreignKey} = ?`,
            [rows, 0],
            {
              sourceId: source.id || "",
              operation: "tree-root-zero-fallback",
              rowCount: rows.length,
            }
          )
        );
      }

      if (rootRecord.length == 0) {
       //console.log(source.data, nullValue,foreignKey);
        throw new Error(
          `Tree command has no root record in data member '${source.id}' with '${nullValue}' value in '${foreignKey}' column that set in NullValue attribute!`
        );
      }
      const rootRenderParam = new RenderParam(
        replaces,
        rootRecord.length,
        dividerRowCount,
        dividerTemplate,
        incompleteTemplate
      );
      for (const row of rootRecord) {
        rootRenderParam.data = row;
        let temp = renderLevel(rootRenderParam, 1);
        retVal += temp ?? "";
      }
      /**
       * @param {RenderParam} parentRenderParam
       * @param {number} level
       * @param {Array<object>} processedRows
       * @returns {string}
       */
      function renderLevel(parentRenderParam, level) {
        /** @type {string} */
        let retVal = null;
        if (processedRows.indexOf(parentRenderParam.data) != -1) {
          throw new Error(
            `Infinity loop detect in tree data source! Row with value '${parentRenderParam.Data[principalKey]}' in column '${principalKey}' cause loop.`
          );
        } else {
          processedRows.push(parentRenderParam.data);
        }
        let childRenderResult = "";
        const childRows = SourceUtil.runQuery(
          `SELECT VALUE FROM ? WHERE ${foreignKey} = ?`,
          [rows, parentRenderParam.data[principalKey]],
          {
            sourceId: source.id || "",
            operation: "tree-children",
            rowCount: rows.length,
          }
        );
        /** @type {NodeJS.Dict<string>} */
        const groups = {};
        attachScalarChildFields(parentRenderParam.data, childRows);
        if (childRows.length > 0) {
          const newLevel = level + 1;
          const childRenderParam = new RenderParam(
            replaces,
            childRows.length,
            dividerRowCount,
            dividerTemplate,
            incompleteTemplate
          );
          if (Util.isNullOrEmpty(relationColumnName)) {
            childRows.forEach((row) => {
              childRenderParam.data = row;
              childRenderResult +=
                renderLevel(childRenderParam, newLevel) ?? "";
            });
            groups[""] = childRenderResult;
          } else {
            const relationBaseGroups = Util.groupBy(
              rows,
              relationColumnName
            );
            for (const key in relationBaseGroups) {
              if (Object.prototype.hasOwnProperty.call(relationBaseGroups, key)) {
                const group = relationBaseGroups[key];
                group.forEach((row) => {
                  childRenderParam.data = row;
                  childRenderResult += renderLevel(childRenderParam, newLevel);
                });
                groups[key] = childRenderResult;
                childRenderResult = "";
              }
            }
          }
          parentRenderParam.setLevel(`${level}`);
        } else {
          groups[""] = "";
          parentRenderParam.setLevel([`${level}`, "end"]);
        }
        retVal = faces.render(parentRenderParam, context);
        if (retVal) {
          for (const key in groups) {
            if (Object.prototype.hasOwnProperty.call(groups, key)) {
              retVal = StringUtil.replace(
                retVal,
                `@child${key ? /\(${key}\)/ : ""}`,
                groups[key]
              );
            }
          }
        }
        return retVal ?? Object.values(groups).join("");
      }
    }
    return retVal;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await Promise.all([
      tag.addAttributeIfExistAsync("idcol", this.principalKey, context),
      tag.addAttributeIfExistAsync("parentidcol", this.foreignKey, context),
      tag.addAttributeIfExistAsync("nullvalue", this.nullValue, context),
      tag.addAttributeIfExistAsync(
        "relationnamecol",
        this.relationColumnName,
        context
      ),
    ]);
    return tag;
  }
}
