import ICommandResult from "./ICommandResult.js";

export default class VoidResult extends ICommandResult {
  /**@type {ICommandResult} */
  static result = new VoidResult();
}
