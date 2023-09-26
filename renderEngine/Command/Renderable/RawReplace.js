import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";

export default class RawReplace {
  /** @type {IToken} */
  tagName;
  /** @type {IToken} */
  content;

  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    this.tagName = TokenUtil.getFiled(ilObject, "tagName");
    this.content = TokenUtil.getFiled(ilObject, "content");
  }
}
