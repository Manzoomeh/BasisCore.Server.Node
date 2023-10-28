import IContext from "../Context/IContext.js";
import IDataSource from "../Source/IDataSource.js";
import IToken from "../Token/IToken.js";
import CommandBase from "./CommandBase.js";
import ICommandResult from "../Models/ICommandResult.js";
import TokenUtil from "../Token/TokenUtil.js";

export default class SourceBaseCommand extends CommandBase {
  /**@type {IToken} */
  sourceId;
  /**
   * @param {object} sourceBaseCommandIl
   */
  constructor(sourceBaseCommandIl) {
    super(sourceBaseCommandIl);
    this.sourceId = TokenUtil.getFiled(sourceBaseCommandIl, "data-member-name");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const sourceId = await this.sourceId.getValueAsync(context);
    const source = sourceId
      ? await context.waitToGetSourceAsync(sourceId)
      : null;
    context.cancellation.throwIfCancellationRequested();
    return await this._renderAsync(source, context);
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  _renderAsync(source, context) {
    return Promise.resolve(
      new ExceptionResult(
        new Error("executeCommandAsync not implemented"),
        context
      )
    );
  }
}
