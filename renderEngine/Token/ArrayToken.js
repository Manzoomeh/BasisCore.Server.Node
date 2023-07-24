import IToken from "./IToken";

export default class ArrayToken extends IToken {
  /** @type {Array<IToken>} */
  values;

  /** @param {Array<IToken>} */
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
    return values.join();
  }
}
