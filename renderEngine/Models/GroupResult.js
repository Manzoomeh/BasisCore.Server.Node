import ICommandResult from "./ICommandResult.js";

export default class GroupResult extends ICommandResult {
  /** @type {Array<ICommandResult>} */
  _results;
  /**
   * @param {Array<ICommandResult>} result
   */
  constructor(result) {
    super();
    this._results = result;
  }

  /**
   * @param {*} stream
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<void>}
   */
  async writeAsync(stream, cancellationToken) {
    for (const result of this._results) {
      await result.writeAsync(stream, cancellationToken);
    }
  }
}
