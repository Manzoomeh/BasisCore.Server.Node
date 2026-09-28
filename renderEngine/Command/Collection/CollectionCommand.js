import CommandBase from "./../CommandBase.js";
import SourceCommand from "../Source/BaseClasses/SourceCommand.js";
import CallCommand from "./CallCommand.js";
import ICommandResult from "../../Models/ICommandResult.js";
import IContext from "../../Context/IContext.js";
import {
  getRequestTraceId,
  traceError,
  traceRequest,
} from "../../../modules/requestTrace.js";

function resolveRootRequest(context) {
  const visited = new Set();
  let current = context;

  while (current && !visited.has(current)) {
    if (current._request) {
      return current._request;
    }
    visited.add(current);
    current = current._owner;
  }

  return null;
}

function readStaticTokenValue(token) {
  if (!token || typeof token !== "object") {
    return "";
  }
  if (Object.hasOwn(token, "value")) {
    return String(token.value ?? "");
  }
  return `[${token.constructor?.name || "dynamic"}]`;
}

function describeCommand(command) {
  return {
    commandClass: command?.constructor?.name || "",
    core: readStaticTokenValue(command?.core),
    name: readStaticTokenValue(command?.name),
    run: readStaticTokenValue(command?.runType),
    connectionName: readStaticTokenValue(command?.connectionName),
    procedureName: readStaticTokenValue(command?.procedureName),
    apiUrl: readStaticTokenValue(command?.url),
  };
}

export default class CollectionCommand extends CommandBase {
  /** @type {Array<object>} */
  commandsObjects;
  /** @type {Array<CommandBase>} */
  commands;
  /** @type {number} */
  callDepth;
  /** @type {string[]} */
  callPath;
  /** @type {{pageName: string, signature: string}[]} */
  callFrames;
  /**
   * @param {object} groupCommandIl
   */
  constructor(collectionCommandIl) {
    super(collectionCommandIl);
    this.commandsObjects = collectionCommandIl["Commands"];
    this.callDepth = 0;
    this.callPath = [];
    this.callFrames = [];
  }

  /**
   * @param {IContext} newContext
   * @returns {Promise<ICommandResult[]>}
   */
  async executeCommandBlocks(newContext) {
    this.commands = this.commandsObjects?.map((command) => {
      return newContext.createCommand(command);
    })??[];
    /** @type {Array<CommandBase>} */
    const commands = [];
    for (const element of this.commands) {
      const command = element;
      if (command instanceof CallCommand) {
        command.callDepth = this.callDepth;
        command.callPath = [...this.callPath];
        command.callFrames = [...this.callFrames];
        commands.push(...(await command.callAsync(newContext)));
      } else {
        commands.push(command);
      }
    }

    const collections = commands.map(
      (command, index) => new CollectionCommandItem(command, index)
    );
    await Promise.all(
      collections
        .filter((x) => x.IsSourceCommand)
        .map((x) => x.executeAsync(newContext, "source"))
    );
    await Promise.all(
      collections
        .filter((x) => !x.IsSourceCommand)
        .map((x) => x.executeAsync(newContext, "render"))
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
    return (
      this.command instanceof SourceCommand ||
      this.command?.isSourceProducer === true
    );
  }

  /**
   * @param {CommandBase} command
   * @param {number} index
   */
  constructor(command, index) {
    this.command = command;
    this.index = index;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async executeAsync(context, phase) {
    if (!this.command || typeof this.command.executeAsync !== "function") {
      throw new Error("CollectionCommandItem received invalid command instance");
    }
    const startedAt = Date.now();
    const request = resolveRootRequest(context);
    const tracePayload = {
      traceId: getRequestTraceId(request),
      phase,
      commandIndex: this.index,
      ...describeCommand(this.command),
    };

    traceRequest("command.execute.start", tracePayload);
    try {
      this.result = await this.command.executeAsync(context);
      traceRequest("command.execute.done", {
        ...tracePayload,
        elapsedMs: Date.now() - startedAt,
        resultType: this.result?.constructor?.name || "",
      });
    } catch (error) {
      traceError("command.execute.error", error, {
        ...tracePayload,
        elapsedMs: Date.now() - startedAt,
      });
      throw error;
    }
  }
}
