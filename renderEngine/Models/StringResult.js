import ICommandResult from "./ICommandResult.js";

export default class StringResult extends ICommandResult {
  /** @type {string} */
  _result;

  /**
   * @param {string} result
   */
  constructor(result) {
    super();
    this._result = result;
  }

  /**
   * @param {*} stream
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<void>}
   */
  writeAsync(stream, cancellationToken) {
    console.log(this._result);
    return Promise.resolve();
  }
}
