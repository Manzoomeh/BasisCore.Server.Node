import TokenUtil from "../Token/TokenUtil.js";
import StringResult from "../Models/StringResult.js";
import CommandBase from "./CommandBase.js";

export default class RawText extends CommandBase {
  /**@type {IToken} */
  content;
  /**
   * @param {object} rawTextIl
   */
  constructor(rawTextIl) {
    super(rawTextIl);
    this.content = TokenUtil.getFiled(rawTextIl, "content");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async executeAsync(context) {
    const content = await this.content.getValueAsync(context);
    return new StringResult(content);
  }
}
