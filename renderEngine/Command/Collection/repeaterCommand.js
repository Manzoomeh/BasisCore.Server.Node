import CommandUtil from "../../../test/command/CommandUtil.js";
import IContext from "../../Context/IContext.js";
import GroupResult from "../../Models/GroupResult.js";
import SourceCommand from "../Source/BaseClasses/SourceCommand.js";
import CallCommand from "./CallCommand.js";
import SourceBaseCommand from "../SourceBaseCommand.js";
import CommandBase from "../CommandBase.js";
import JsonSource from "../../Source/JsonSource.js";
import ICommandResult from "../../Models/ICommandResult.js";
import LocalContext from "./../../Context/LocalContext.js";
export default class RepeaterCommand extends SourceBaseCommand {
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
   * @returns {Promise<GroupResult>}
   */
  async _executeCommandAsync(context) {
    const mainSource = await context.waitToGetSourceAsync(
      await this.sourceId.getValueAsync()
    );
    const results = [];
    for (const row of mainSource.data) {
      /** @type {Array<CommandBase>} */
      const sourceTasks = [];
      /** @type {Array<CommandBase>} */
      const otherTasks = [];
      let newContext = new LocalContext(context);
      newContext.addSource(
        new JsonSource([row], `${await this.name.getValueAsync()}.current`)
      );
      this.commands.forEach((x) =>
        x instanceof SourceCommand
          ? sourceTasks.push(x.executeAsync(newContext))
          : otherTasks.push(x.executeAsync(newContext))
      );
      await Promise.all(sourceTasks);
      const result = await Promise.all(otherTasks);
      results.push(...result);
    }
    return new GroupResult(results);
  }
}
