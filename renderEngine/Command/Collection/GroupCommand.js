import CommandUtil from "../../../test/command/CommandUtil.js";
import IContext from "../../Context/IContext.js";
import GroupResult from "../../Models/GroupResult.js";
import CommandBase from "../CommandBase.js";
import CallCommand from "./CallCommand.js";

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
    const commands = [];
    for (let i = 0; i < this.commands.length; i++) {
      const command = this.commands[i];
      if (command instanceof CallCommand) {
        commands.push(...(await command.callAsync(newContext)));
      } else {
        commands.push(command);
      }
    }
    const results = await Promise.all(
      commands.map((x) => x.executeAsync(newContext))
    );
    return new GroupResult(results);
  }
}
