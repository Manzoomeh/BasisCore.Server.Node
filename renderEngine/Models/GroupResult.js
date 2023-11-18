import ICommandResult from "./ICommandResult.js";
import VoidResult from "./VoidResult.js";

export default class GroupResult extends ICommandResult {
  /** @type {Array<ICommandResult>} */
  _results;
  /**
   * @param {Array<ICommandResult>} results
   */
  constructor(results) {
    super();
    this._results = results;
  }

  /**
   * @param {Array<string>} stream
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<void>}
   */
  async writeAsync(stream, cancellationToken) {
    try {
      for (const result of this._results) {
        if (!(result instanceof VoidResult)) {
          await result.writeAsync(stream, cancellationToken);
        }
      }
    } catch (ex) {
      console.error(ex);
    }
  }
}
