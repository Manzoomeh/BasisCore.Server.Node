import IContext from "../Context/IContext.js";
import StringResult from "../Models/StringResult.js";
import IDataSource from "../Source/IDataSource.js";
import IToken from "../Token/IToken.js";
import StringUtil from "../Token/StringUtil.js";
import TokenUtil from "../Token/TokenUtil.js";
import RenderParam from "./RenderParam.js";
import FaceCollection from "./Renderable/FaceCollection.js";
import RawFaceCollection from "./Renderable/RawFaceCollection.js";
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
  /**@type {IToken} */
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
    // this.elseLayout = TokenUtil.getObjectFiledAsToken(
    //   commandIL,
    //   "else-layout-content"
    // );
    //   this.elseLayout = TokenUtil.getObjectFiledAsToken(
    //   commandIL,
    //   "else-layout-content"
    // );
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _renderAsync(source, context) {
    var faceTask = this.rawFaces
      ? this.rawFaces.getFaceListAsync(source, context)
      : Promise.resolve([]);
    const renderResult = await this.renderAsync__(
      source,
      context,
      await faceTask
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
   * @param {FaceCollection} faces
   * @returns {string}
   */
  renderAsync__(source, context, faces) {
    const param = new RenderParam(
      null,
      source?.data.length ?? 0,
      0,
      null,
      null
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
