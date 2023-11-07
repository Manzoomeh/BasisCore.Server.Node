import CancellationToken from "./CancellationToken";

class CancellationError extends Error {
  /**@type {CancellationToken} */
  token;
  /**
   *
   * @param {CancellationToken} token
   * @param  {...any} params
   */
  constructor(token, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = "CustomError";
    // Custom debugging information
    this.foo = foo;
    this.date = new Date();
  }
}
