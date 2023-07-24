import IToken from "./IToken";

export default class ValueToken extends IToken {
  /**@type {string} */
  value;

  /**@param {string} */
  constructor(value) {
    super();
    this.value = value;
  }

  /**
   * @param {IContext}
   * @returns {Promise<string>}
   */
  getValueAsync(context) {
    return Promise.resolve(this.value);
  }
}
