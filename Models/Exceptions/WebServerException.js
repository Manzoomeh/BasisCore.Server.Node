import BasisCoreException from "./BasisCoreException.js";

export default class WebServerException extends BasisCoreException {
  /**
   * @param {string?} message
   * @param {Error?} innerException
   */
  constructor(message, innerException) {
    super(message, { cause: innerException });
  }
}
