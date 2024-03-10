import CommandBase from "./../CommandBase.js";
import SourceCommand from "../Source/BaseClasses/SourceCommand.js";
import CallCommand from "./CallCommand.js";
import CommandUtil from "../../../test/command/CommandUtil.js";

export default class CollectionCommand extends CommandBase {
  /** @type {Array<CommandBase>} */
  commands;
  /**
   * @param {object} groupCommandIl
   */
  constructor(collectionCommandIl) {
    super(collectionCommandIl);
    this.commands = collectionCommandIl["Commands"].map(
      CommandUtil.createCommand
    );
  }

  /**
   * @param {IContext} newContext
   * @returns {Promise<CommandBase[]>}
   */
  async executeCommandBlocks(newContext) {
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
    return sourceResults.concat(otherResult);
  }
}
