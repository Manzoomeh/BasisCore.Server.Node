import TokenUtil from "../../../Token/TokenUtil.js";

export default class ParamItem {
  /** @type {IToken} */
  name;
  /** @type {IToken} */
  value;

  /**
   *
   * @param {object} ilObject
   */
  constructor(ilObject) {
    this.name = TokenUtil.getFiled(ilObject, "name");
    this.value = TokenUtil.getFiled(ilObject, "value");
  }
}
