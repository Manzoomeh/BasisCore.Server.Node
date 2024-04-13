import CommandBase from "./CommandBase.js";
import TokenUtil from "../Token/TokenUtil.js";
import VoidResult from "../Models/VoidResult.js";
import IContext from "../Context/IContext.js";
import CommandElement from "./CommandElement.js";

export default class CookieCommand extends CommandBase {
  /*** @type {IToken}*/
  value;
  /*** @type {IToken}*/
  maxAge;
  /*** @type {IToken}*/
  path;

  /**
   * @param {object} cookieIl
   */
  constructor(cookieIl) {
    super(cookieIl);
    this.value = TokenUtil.getFiled(cookieIl, "value");
    this.maxAge = TokenUtil.getFiled(cookieIl, "maxAge");
    this.path = TokenUtil.getFiled(cookieIl, "path");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const [name, value, maxAge, path] = await Promise.all([
      this.name.getValueAsync(context),
      this.value.getValueAsync(context),
      this.maxAge.getValueAsync(context),
      this.path.getValueAsync(context),
    ]);
    context.addCookie(name, value, maxAge, path);
    return VoidResult.result;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await Promise.all([
      tag.addAttributeIfExistAsync("value", this.value, context),
      tag.addAttributeIfExistAsync("max-age", this.maxAge, context),
      tag.addAttributeIfExistAsync("path", this.path, context),
    ]);
    return tag;
  }
}
