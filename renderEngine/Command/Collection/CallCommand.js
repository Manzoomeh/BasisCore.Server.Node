import IContext from "../../Context/IContext.js";
import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";
import CommandBase from "../CommandBase.js";
import GroupCommand from "../Collection/GroupCommand.js";
import RunTypes from "../../Enums/RunTypes.js";

export default class CallCommand extends CommandBase {
  /** @type {IToken} */
  file;
  /** @type {IToken} */
  pageSize;
  /** @type {number} */
  callDepth;
  /**
   * @param {object} callCommandIl
   */
  constructor(callCommandIl) {
    super(callCommandIl);
    this.file = TokenUtil.getFiled(callCommandIl, "FileName");
    this.pageSize = TokenUtil.getFiled(callCommandIl, "pagesize");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandBase[]>}
   */
  async callAsync(context) {
    const runType = await this._getRunTypeValueAsync(context);
    const ifValue = await this._getIfValueAsync(context);
    let retVal;

    if (runType.toLowerCase() == RunTypes.AtClient) {
      retVal = [this];
    } else if (!ifValue) {
      retVal = [];
    } else {
      /** @type {CommandBase[]} */
      const [pageName, pageSize, html] = await Promise.all([
        this.file.getValueAsync(context),
        this.pageSize.getValueAsync(context),
        this.createHtmlElementAsync(context),
      ]);
      context.cancellation.throwIfCancellationRequested();
      const command = await context.loadPageAsync(
        pageName,
        html.getHtml(),
        pageSize,
        this.callDepth + 1
      );
      if (command instanceof CallCommand) {
        command.callDepth = this.callDepth + 1;
        retVal = await command.callAsync(context);
      } else if (command instanceof GroupCommand) {
        retVal = [];
        for (let i = 0; i < command.commandsObjects?.length; i++) {
          const item = context.createCommand(command.commandsObjects[i]);
          if (item instanceof CallCommand) {
            retVal.push(...(await item.callAsync(context)));
          } else {
            retVal.push(item);
          }
        }
      } else {
        retVal = [command];
      }
    }

    return retVal;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await Promise.all([
      tag.addAttributeIfExistAsync("file", this.file, context),
      tag.addAttributeIfExistAsync("pagesize", this.pageSize, context),
    ]);
    return tag;
  }
}
