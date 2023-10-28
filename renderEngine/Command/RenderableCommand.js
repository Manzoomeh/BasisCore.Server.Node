import IContext from "../Context/IContext.js";
import StringResult from "../Models/StringResult.js";
import IDataSource from "../Source/IDataSource.js";
import IToken from "../Token/IToken.js";
import StringUtil from "../Token/StringUtil.js";
import TokenUtil from "../Token/TokenUtil.js";
import RenderParam from "./RenderParam.js";
import FaceCollection from "./Renderable/FaceCollection.js";
import RawFaceCollection from "./Renderable/RawFaceCollection.js";
import RawReplaceCollection from "./Renderable/RawReplaceCollection.js";
import ReplaceCollection from "./Renderable/ReplaceCollection.js";
import SourceBaseCommand from "./SourceBaseCommand.js";

export default class RenderableCommand extends SourceBaseCommand {
  /**@type {IToken} */
  dividerTemplate;
  /**@type {IToken} */
  dividerRowCount;
  /**@type {IToken} */
  incompleteTemplate;
  /**@type {IToken} */
  elseLayout;
  /**@type {IToken} */
  layout;
  /**@type {RawFaceCollection} */
  rawFaces;
  /**@type {RawReplaceCollection} */
  replaces;

  constructor(commandIL) {
    super(commandIL);
    this.dividerTemplate = TokenUtil.getFiled(commandIL, "divider-content");
    this.dividerRowCount = TokenUtil.getFiled(commandIL, "divider-rowcount");
    this.incompleteTemplate = TokenUtil.getFiled(
      commandIL,
      "incomplete-content"
    );
    this.elseLayout = TokenUtil.getFiled(commandIL, "else-layout-content");
    this.layout = TokenUtil.getFiled(commandIL, "layout-content");
    this.rawFaces = new RawFaceCollection(commandIL["faces"]);
    this.replaces = new RawReplaceCollection(commandIL["replaces"]);
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _renderAsync(source, context) {
    const [
      face,
      replace,
      dividerRowCount,
      dividerTemplate,
      incompleteTemplate,
    ] = await Promise.all([
      this.rawFaces
        ? this.rawFaces.getFaceListAsync(source, context)
        : Promise.resolve([]),
      this.replaces.processAsync(console),
      this.dividerRowCount.getValueAsync(context) ?? Promise.resolve(0),
      this.dividerTemplate.getValueAsync(context),
      this.incompleteTemplate.getValueAsync(context),
    ]);
    const renderResult = await this.renderInternallyAsync(
      source,
      context,
      face,
      replace,
      dividerRowCount,
      dividerTemplate,
      incompleteTemplate
    );
    let result = null;
    if ((renderResult?.length ?? 0) > 0) {
      const layout = await this.layout.getValueAsync(context);
      result = layout
        ? StringUtil.replace(layout, "@child", renderResult)
        : renderResult;
    } else {
      result = await this.elseLayout.getValueAsync(context);
    }
    return new StringResult(result);
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @param {FaceCollection} faces,
   * @param {ReplaceCollection} replaces ,
   * @param {number} dividerRowCount ,
   * @param {string} dividerTemplate ,
   * @param {string} incompleteTemplate ,
   * @returns {Promise<string>}
   */
  renderInternallyAsync(
    source,
    context,
    faces,
    replaces,
    dividerRowCount,
    dividerTemplate,
    incompleteTemplate
  ) {
    const param = new RenderParam(
      replaces,
      source?.data.length ?? 0,
      dividerRowCount,
      dividerTemplate,
      incompleteTemplate
    );
    let retVal = "";
    if (source) {
      source.data.forEach((row) => {
        param.data = row;
        const renderResult = faces.render(param, context);
        if (renderResult) {
          retVal += renderResult;
        }
      });
      return Promise.resolve(retVal);
    }
  }
}
