import IToken from "./IToken.js";

export default class ValueToken extends IToken {
  /** @type {ValueToken} */
  static Null = new ValueToken(null);
  /**@type {string} */
  value;

  /**@param {string} value */
  constructor(value) {
    super();
    this.value = value;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<string>}
   */
  getValueAsync(context) {
    return Promise.resolve(this.value);
  }

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    return this !== ValueToken.Null;
  }
}
