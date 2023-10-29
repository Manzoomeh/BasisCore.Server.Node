import IContext from "../Context/IContext.js";
import IToken from "../Token/IToken.js";
import TokenUtil from "../Token/TokenUtil.js";
import RenderableCommand from "./RenderableCommand.js";

export default class ViewCommand extends RenderableCommand {
  static groupcol_Name = "groupcol";
  /** @type {IToken} */
  groupColumn;
  /**
   * @param {object} viewCommandIl
   */
  constructor(viewCommandIl) {
    super(viewCommandIl);
    this.groupColumn = TokenUtil.getFiled(
      viewCommandIl,
      ViewCommand.groupcol_Name
    );
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
  async renderInternallyAsync(
    source,
    context,
    faces,
    replaces,
    dividerRowCount,
    dividerTemplate,
    incompleteTemplate
  ) {
    const groupColumn = await TokenUtil.getValueOrSystemDefaultAsync(
      this.groupColumn,
      ViewCommand.groupcol_Name
    );

    console.log("q", groupColumn);
  }
}
