import IContext from "../Context/IContext.js";

export default class IToken {
  /**
   * @param {IContext} context
   * @returns {Promise<string>}
   */
  getValueAsync(context) {
    throw new Error("Method not implemented.");
  }

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    throw new Error("Method not implemented.");
  }
}
