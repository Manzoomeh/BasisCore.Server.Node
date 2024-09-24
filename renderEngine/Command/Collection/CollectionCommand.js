import CommandBase from "./../CommandBase.js";
import SourceCommand from "../Source/BaseClasses/SourceCommand.js";
import CallCommand from "./CallCommand.js";
import ICommandResult from "../../Models/ICommandResult.js";
import IContext from "../../Context/IContext.js";

export default class CollectionCommand extends CommandBase {
  /** @type {Array<object>} */
  commandsObjects;
  /** @type {Array<CommandBase>} */
  commands;
  /**
   * @param {object} groupCommandIl
   */
  constructor(collectionCommandIl) {
    super(collectionCommandIl);
    this.commandsObjects = collectionCommandIl["Commands"];
  }

  /**
   * @param {IContext} newContext
   * @returns {Promise<ICommandResult[]>}
   */
  async executeCommandBlocks(newContext) {
    this.commands = this.commandsObjects.map((command) => {
      return newContext.createCommand(command);
    });
    /** @type {Array<CommandBase>} */
    const commands = [];
    for (const element of this.commands) {
      const command = element;
      if (command instanceof CallCommand) {
        commands.push(...(await command.callAsync(newContext)));
      } else {
        commands.push(command);
      }
    }

    const collections = commands.map((x) => new CollectionCommandItem(x));
    await Promise.all(
      collections
        .filter((x) => x.IsSourceCommand)
        .map((x) => x.executeAsync(newContext))
    );
    await Promise.all(
      collections
        .filter((x) => !x.IsSourceCommand)
        .map((x) => x.executeAsync(newContext))
    );
    return collections.map((x) => x.result);
  }
}

class CollectionCommandItem {
  /** @type {CommandBase} */
  command;
  /** @type {ICommandResult} */
  result;
  /** @returns {boolean} */
  get IsSourceCommand() {
    return this.command instanceof SourceCommand;
  }

  /**
   * @param {CommandBase} command
   */
  constructor(command) {
    this.command = command;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async executeAsync(context) {
    this.result = await this.command.executeAsync(context);
  }
}
