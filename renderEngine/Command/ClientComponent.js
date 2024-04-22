import ExceptionResult from "../Models/ExceptionResult.js";
import TokenUtil from "../Token/TokenUtil.js";
import CommandBase from "./CommandBase.js";

export default class ClientComponent extends CommandBase {
  /*** @type {IToken}*/
  _core;

  /**
   * @param {object} clientCommandIl
   */
  constructor(clientCommandIl) {
    super(clientCommandIl);
    this._core = TokenUtil.getFiled(clientCommandIl, "_core");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const core = await this._core.getValueAsync(context);
    return new ExceptionResult(
      new Error(
        `ExecuteCommandAsync for '${core}' command not supported in server side`
      ),
      context
    );
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await tag.addAttributeIfExistAsync("core", this._core, context);
    return tag;
  }
}
