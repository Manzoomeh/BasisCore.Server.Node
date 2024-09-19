import alasql from "alasql";
import TokenUtil from "../Token/TokenUtil.js";
import RenderableCommand from "./RenderableCommand.js";
import RenderParam from "./RenderParam.js";
import FaceCollection from "./Renderable/FaceCollection.js";
import StringUtil from "../Token/StringUtil.js";
import Util from "../../Util.js";
import SourceUtil from "../Source/SourceUtil.js";

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
    if ((source.data?.length ?? 0) > 0) {
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

      const nullValue =
        typeof source.data[0][foreignKey] === "number"
          ? Number(tempNullValue)
          : tempNullValue;

      const rootRecord = alasql(`SELECT VALUE FROM ? WHERE ${foreignKey} = ?`, [
        source.data,
        nullValue,
      ]);
      if (rootRecord.length == 0) {
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
        const childRows = alasql(
          `SELECT VALUE FROM ? WHERE ${foreignKey} = ?`,
          [source.data, parentRenderParam.data[principalKey]]
        );
        /** @type {NodeJS.Dict<string>} */
        const groups = {};
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
              source.data,
              relationColumnName
            );
            for (const key in relationBaseGroups) {
              if (Object.hasOwn(relationBaseGroups, key)) {
                const group = relationBaseGroups[key];
                group.forEach((row) => {
                  childRenderParam.data = row;
                  childRenderResult += renderLevel(childRenderResult, newLevel);
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
            if (Object.hasOwn(groups, key)) {
              retVal = StringUtil.replace(
                retVal,
                `@child${key ? /\(${key}\)/ : ""}`,
                groups[key]
              );
            }
          }
        }
        return retVal;
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
