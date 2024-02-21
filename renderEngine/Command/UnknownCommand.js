import ExceptionResult from "../Models/ExceptionResult.js";
import CommandBase from "./CommandBase.js";

export default class UnknownCommand extends CommandBase {
  /**
   * @param {object} rawIl
   */
  constructor(rawIl) {
    super(rawIl);
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const core = await this.core.getValueAsync(context);
    return new ExceptionResult(
      new Error(
        `Command ${core} not support in this version of render engine!`
      ),
      context
    );
  }
}
