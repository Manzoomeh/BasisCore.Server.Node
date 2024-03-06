import CommandUtil from "../../../test/command/CommandUtil.js";
import IContext from "../../Context/IContext.js";
import GroupResult from "../../Models/GroupResult.js";
import CommandBase from "../CommandBase.js";
import SourceCommand from "../Source/BaseClasses/SourceCommand.js";
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
    const newContext = context.createContext("group");
    const commands = [];
    for (const element of this.commands) {
      const command = element;
      if (command instanceof CallCommand) {
        commands.push(...(await command.callAsync(newContext)));
      } else {
        commands.push(command);
      }
    }
    /** @type {Array<CommandBase>} */
    const sourceCommands = [];
    /** @type {Array<CommandBase>} */
    const otherCommands = [];
    commands.forEach((x) =>
      x instanceof SourceCommand
        ? sourceCommands.push(x)
        : otherCommands.push(x)
    );

    const sourceResults = await Promise.all(
      sourceCommands.map((x) => x.executeAsync(newContext))
    );
    const otherResult = await Promise.all(
      otherCommands.map((x) => x.executeAsync(newContext))
    );
    return new GroupResult(sourceResults.concat(otherResult));
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    const childTags = await Promise.all(
      this.commands.map((x) => x.createHtmlElementAsync(context))
    );
    childTags.forEach((childTag) => {
      tag.addChild(childTag);
    });
    return tag;
  }
}
