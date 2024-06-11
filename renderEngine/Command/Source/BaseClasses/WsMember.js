import IContext from "../../../Context/IContext.js";
import Member from "./Member.js";
import CommandElement from "../../CommandElement.js";
import TokenUtil from "../../../Token/TokenUtil.js";

export default class WsMember extends Member {
  /** @type {IToken} */
  method;
  /**@type {IToken} */
  query;
  /**
   * @param {object} memberIL
   */
  constructor(memberIL) {
    super(memberIL);
    this.method = TokenUtil.getFiled(memberIL, "method");
    this.query = TokenUtil.getFiled(memberIL, "query");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = new CommandElement("member");
    tag.addAttributeIfExist("name", this.name);
    await Promise.all([
      tag.addAttributeIfExistAsync("preview", this.preview, context),
      tag.addAttributeIfExistAsync("sort", this.sort, context),
      tag.addAttributeIfExistAsync("method", this.method, context),
      tag.addAttributeIfExistAsync("query", this.query, context),
    ]);
    if (this.extraAttributes) {
      if (this.extraAttributes) {
        await Promise.all(
          Object.entries(this.extraAttributes).map((pair) =>
            tag.addAttributeIfExistAsync(pair[0], pair[1], context)
          )
        );
      }
    }
    await tag.addRawContentIfExistAsync(this.rawContent, context);
    return tag;
  }
}
