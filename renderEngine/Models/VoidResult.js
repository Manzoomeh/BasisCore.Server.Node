import ICommandResult from "./ICommandResult.js";

export default class VoidResult extends ICommandResult {
  /**@type {ICommandResult} */
  static result = new VoidResult();

  /**
   * @param {*} stream
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<void>}
   */
  writeAsync(stream, cancellationToken) {
    return Promise.resolve();
  }
}
