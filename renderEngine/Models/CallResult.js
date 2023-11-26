import ICommandResult from "./ICommandResult.js";

export default class CallResult extends ICommandResult {
  /** @type {Array<CommandBase>} */
  commands;

  constructor() {
    super();
  }
}
