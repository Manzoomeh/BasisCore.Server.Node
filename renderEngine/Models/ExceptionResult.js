import IContext from "../Context/IContext.js";
import ICommandResult from "./ICommandResult.js";

export default class ExceptionResult extends ICommandResult {
  /** @type {Error} */
  exception;
  /** @type {IContext} */
  context;

  /**
   * @param {Error} exception
   * @param {IContext} context
   */
  constructor(exception, context) {
    super();
    this.exception = exception;
    this.context = context;
  }

  /**
   * @param {Array<string>} stream
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<void>}
   */
  writeAsync(stream, cancellationToken) {
    stream?.push(this.exception.message);
  }
}
