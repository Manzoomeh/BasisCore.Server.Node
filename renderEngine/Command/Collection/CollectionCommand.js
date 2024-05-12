import CommandBase from "./../CommandBase.js";
import SourceCommand from "../Source/BaseClasses/SourceCommand.js";
import CallCommand from "./CallCommand.js";
import CommandUtil from "../../../test/command/CommandUtil.js";
import IContext from "../../Context/IContext.js";

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
    /** @type {Array<CommandBase>} */
    const sourceCommands = [];
    /** @type {Array<CommandBase>} */
    const otherCommands = [];
    commands.forEach((x) =>
      x instanceof SourceCommand
        ? sourceCommands.push(x)
        : otherCommands.push(x)
    );
    const executeSourceCommandsStep = newContext.debugContext.newStep(
      `Execute ${sourceCommands.length + 1} source command(s)`
    );

    let sourceResults;
    try {
      sourceResults = await Promise.all(
        sourceCommands.map((x) => x.executeAsync(newContext))
      );
      executeSourceCommandsStep.complete();
    } catch (error) {
      executeSourceCommandsStep.failed();
    }
    const executeRenderableCommandsStep = newContext.debugContext.newStep(
      `Execute ${otherCommands.length + 1} renderable command(s)`
    );
    let otherResult;
    try {
      otherResult = await Promise.all(
        otherCommands.map((x) => x.executeAsync(newContext))
      );
      executeRenderableCommandsStep.complete();
    } catch (error) {
      executeRenderableCommandsStep.failed();
    }
    return sourceResults.concat(otherResult);
  }
}
