import IContext from "../../Context/IContext.js";
import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";
import CommandElement from "../CommandElement.js";

export default class RawFace {
  /**@type {IToken} */
  applyReplace;
  /**@type {IToken} */
  applyFunction;
  /**@type {IToken} */
  level;
  /**@type {IToken} */
  rowType;
  /**@type {IToken} */
  filter;
  /**@type {IToken} */
  content;

  constructor(ilObject) {
    this.applyReplace = TokenUtil.getFiled(ilObject, "replace");
    this.applyFunction = TokenUtil.getFiled(ilObject, "function");
    this.level = TokenUtil.getFiled(ilObject, "level");
    this.rowType = TokenUtil.getFiled(ilObject, "row-type");
    this.filter = TokenUtil.getFiled(ilObject, "filter");
    this.content = TokenUtil.getFiled(ilObject, "content");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = new CommandElement("face");
    await Promise.all([
      tag.addAttributeIfExistAsync("replace", this.applyReplace, context),
      tag.addAttributeIfExistAsync("function", this.applyFunction, context),
      tag.addAttributeIfExistAsync("level", this.level, context),
      tag.addAttributeIfExistAsync("rowType", this.rowType, context),
      tag.addAttributeIfExistAsync("filter", this.filter, context),
      tag.addRawContentIfExistAsync(this.content, context),
    ]);
    return tag;
  }
}
