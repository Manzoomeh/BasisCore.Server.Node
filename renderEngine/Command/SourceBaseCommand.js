import IContext from "../Context/IContext.js";
import IDataSource from "../Source/IDataSource.js";
import IToken from "../Token/IToken.js";
import CommandBase from "./CommandBase.js";
import ICommandResult from "../Models/ICommandResult.js";
import TokenUtil from "../Token/TokenUtil.js";

export default class SourceBaseCommand extends CommandBase {
  /**@type {IToken} */
  sourceId;

  constructor(commandIL) {
    super(commandIL);
    this.sourceId = TokenUtil.getFiled(commandIL, "data-member-name");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const sourceId = await this.sourceId.getValueAsync(context);
    const source = sourceId
      ? null
      : await context.waitToGetSourceAsync(sourceId);
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
