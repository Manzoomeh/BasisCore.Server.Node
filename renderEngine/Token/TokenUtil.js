import IToken from "./IToken.js";
import SimpleTokenElement from "./SimpleTokenElement.js";
import ValueToken from "./ValueToken.js";
import ArrayToken from "./ArrayToken.js";
import ObjectToken from "./ObjectToken.js";

export default class TokenUtil {
  /**
   * @param {object|string|object[]} value
   * @returns {IToken}
   */
  static ToToken(value) {
    /** @type {IToken} */
    let retVal = null;
    if (typeof value === "string") {
      retVal = new ValueToken(value);
    } else if (Array.isArray(value)) {
      retVal = new ArrayToken(value.map(TokenUtil.ToToken));
    } else if (typeof value === "object") {
      const element = new SimpleTokenElement(
        value.Source,
        value.Member,
        value.Column,
        value.Value
      );
      retVal = new ObjectToken([element]);
    } else {
      retVal = new ValueToken(value);
    }
    return retVal;
  }

  /**
   *
   * @param {object} object
   * @param {string} filedName
   * @returns {IToken}
   */
  static getFiled(object, filedName) {
    const value = object[filedName];
    return value ? TokenUtil.ToToken(value) : ValueToken.Null;
  }
}
