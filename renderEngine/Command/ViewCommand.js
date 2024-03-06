import IContext from "../Context/IContext.js";
import IToken from "../Token/IToken.js";
import TokenUtil from "../Token/TokenUtil.js";
import RenderableCommand from "./RenderableCommand.js";
import IDataSource from "../Source/IDataSource.js";
import alasql from "alasql";
import RenderParam from "./RenderParam.js";
import FaceCollection from "./Renderable/FaceCollection.js";
import ReplaceCollection from "./Renderable/ReplaceCollection.js";
import StringUtil from "../Token/StringUtil.js";

export default class ViewCommand extends RenderableCommand {
  /** @type {IToken} */
  groupColumn;
  /**
   * @param {object} viewCommandIl
   */
  constructor(viewCommandIl) {
    super(viewCommandIl);
    this.groupColumn = TokenUtil.getFiled(viewCommandIl, "GroupColumn");
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
      const groupColumn = await TokenUtil.getValueOrSystemDefaultAsync(
        this.groupColumn,
        "ViewCommand.GroupColumn",
        context,
        "prpid"
      );
      const groupKeyList = alasql(
        `SELECT ${groupColumn} AS key FROM ? GROUP BY ${groupColumn}`,
        [source.data]
      );
      const rootRenderParam = new RenderParam(
        replaces,
        groupKeyList.length,
        dividerRowCount,
        dividerTemplate,
        incompleteTemplate
      );
      rootRenderParam.setLevel("1");
      groupKeyList.forEach((item) => {
        const groupItems = alasql(
          `SELECT VALUE FROM ? WHERE ${groupColumn} = ?`,
          [source.data, item.key]
        );
        //send first row for create level 1
        rootRenderParam.data = groupItems[0];
        const level1Result = faces.render(rootRenderParam, context) ?? "";
        let level2Result = "";
        const childRenderParam = new RenderParam(
          replaces,
          groupItems.length,
          dividerRowCount,
          dividerTemplate,
          incompleteTemplate
        );
        childRenderParam.setLevel("2");
        groupItems.forEach((row) => {
          childRenderParam.data = row;
          const renderResult = faces.render(childRenderParam, context);
          if (renderResult) {
            level2Result += renderResult;
          }
        });
        retVal += StringUtil.replace(level1Result, "@child", level2Result);
      });
    }
    return retVal;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await retVal.addAttributeIfExistAsync(
      "groupcol",
      this.groupColumn,
      context
    );
    return tag;
  }
}
