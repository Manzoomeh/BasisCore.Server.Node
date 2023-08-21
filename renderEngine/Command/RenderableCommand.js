import VoidResult from "../Models/VoidResult.js";
import IToken from "../Token/IToken.js";
import TokenUtil from "../Token/TokenUtil.js";
import RowFaceCollection from "./Renderable/RowFaceCollection.js";
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
  /**@type {RowFaceCollection} */
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
    this.Layout = TokenUtil.getFiled(commandIL, "layout-content");
    //this.RowFaceCollection =
    //   this.elseLayout = TokenUtil.getObjectFiledAsToken(
    //     commandIL,
    //     "else-layout-content"
    //   );
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
  _renderAsync(source, context) {
    return Promise.resolve(VoidResult.result);
  }
}
