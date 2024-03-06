import IToken from "./IToken.js";

export default class ArrayToken extends IToken {
  /** @type {Array<IToken>} */
  values;

  /** @param {Array<IToken>} values*/
  constructor(values) {
    super();
    this.values = values;
  }

  /**
   * @param {IContext}
   * @returns {Promise<string>}
   */
  async getValueAsync(context) {
    const tasks = this.values.map((x) => x.getValueAsync(context));
    const values = await Promise.all(tasks);
    return values.join("");
  }

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    return true;
  }
}
