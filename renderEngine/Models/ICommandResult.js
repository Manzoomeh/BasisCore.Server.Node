import CancellationToken from "../Cancellation/CancellationToken.js";

export default class ICommandResult {
  /**
   * @param {Array<string>} stream
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<void>}
   */
  writeAsync(stream, cancellationToken) {
    throw new Error("Method not implemented.");
  }
}
