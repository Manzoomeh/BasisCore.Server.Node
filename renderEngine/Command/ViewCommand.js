import IToken from "../Token/IToken.js";
import RenderableCommand from "./RenderableCommand.js";

export default class ViewCommand extends RenderableCommand {
  /** @type {IToken} */
  groupColumn;
  /**
   * @param {object} viewCommandIl
   */
  constructor(viewCommandIl) {
    super(viewCommandIl);
    this.groupColumn = TokenUtil.getFiled(viewCommandIl, "groupcol");
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
  ) {}
}
