import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";
import CommandElement from "../CommandElement.js";

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
    this.template = TokenUtil.getFiled(ilObject, "content");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = new CommandElement("replace");
    await Promise.all([
      tag.addAttributeIfExistAsync("tagName", this.tagName, context),
      tag.addRawContentIfExistAsync(this.template, context),
    ]);
    return tag;
  }
}
