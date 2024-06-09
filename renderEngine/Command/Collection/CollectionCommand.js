import CommandBase from "./../CommandBase.js";
import CallCommand from "./CallCommand.js";

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
        const callStep = newContext.debugContext.newStep(
          "Execute call command(s)"
        );
        try {
          commands.push(...(await command.callAsync(newContext)));
        } catch (error) {
          callStep.complete();
        }
        callStep.failed();
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

    const sourceResults = await Promise.all(
      sourceCommands.map((x) => x.executeAsync(newContext))
    );
    const otherResult = await Promise.all(
      otherCommands.map((x) => x.executeAsync(newContext))
    );
    return sourceResults.concat(otherResult);
  }
}
