import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";

export default class RawReplace {
  /** @type {IToken} */
  tagName;
  /** @type {IToken} */
  template;

  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    this.tagName = TokenUtil.getFiled(ilObject, "tagname");
    this.template = TokenUtil.getFiled(ilObject, "template");
  }
}
