import IToken from "./IToken.js";
import SimpleTokenElement from "./SimpleTokenElement.js";
import ValueToken from "./ValueToken.js";
import ArrayToken from "./ArrayToken.js";
import ObjectToken from "./ObjectToken.js";
import IContext from "../Context/IContext.js";

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
      /** @type {SimpleTokenElement[]} */
      const elements = [];
      if (value.Params) {
        value.Params.forEach((item) =>
          elements.push(
            new SimpleTokenElement(
              item.Source,
              item.Member,
              item.Column,
              item.Value
            )
          )
        );
      }
      retVal = new ObjectToken(elements);
    } else {
      retVal = new ValueToken(value);
    }
    return retVal;
  }

  /**
   * @param {object} object
   * @param {string} filedName
   * @returns {IToken}
   */
  static getFiled(object, filedName) {
    const value = object[filedName];
    return value ? TokenUtil.ToToken(value) : ValueToken.Null;
  }

  /**
   * @param {IToken} token
   * @param {string} filedName
   * @param {IContext} context
   * @param {string?} defaultValue
   * @returns {Promise<string>}
   */
  static async getValueOrSystemDefaultAsync(
    token,
    filedName,
    context,
    defaultValue = null
  ) {
    return (
      (await token.getValueAsync(context)) ??
      context.getDefault(filedName, defaultValue)
    );
  }
}
