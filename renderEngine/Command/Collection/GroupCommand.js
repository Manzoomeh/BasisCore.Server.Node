import CommandUtil from "../../../test/command/CommndUtil.js";
import IContext from "../../Context/IContext.js";
import GroupResult from "../../Models/GroupResult.js";
import CommandBase from "../CommandBase.js";

export default class GroupCommand extends CommandBase {
  /** @type {Array<CommandBase>} */
  commands;
  /**
   * @param {object} groupCommandIl
   */
  constructor(groupCommandIl) {
    super(groupCommandIl);
    this.commands = groupCommandIl["Commands"].map(CommandUtil.createCommand);
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    var newContext = context.createContext("group");
    const results = await Promise.all(
      this.commands.map((x) => x.executeAsync(newContext))
    );
    return new GroupResult(results);
  }
}
