export default class BasisCoreException extends Error {
  /**
   *
   * @param {string?} message
   * @param {Error?} innerException
   */
  constructor(message, innerException) {
    super(message, { cause: innerException });
  }
}
