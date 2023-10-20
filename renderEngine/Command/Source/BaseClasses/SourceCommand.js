import IContext from "../../../Context/IContext.js";
import VoidResult from "../../../Models/VoidResult.js";
import IToken from "../../../Token/IToken.js";
import TokenUtil from "../../../Token/TokenUtil.js";
import CommandBase from "../../CommandBase.js";
import CommandElement from "../../CommandElement.js";
import ElementBase from "../../ElementBase.js";
import MemberCollection from "./MemberCollection.js";
import ParamItemCollection from "./ParamItemCollection.js";

export default class SourceCommand extends CommandBase {
  params;
  connectionName;
  /**@type {MemberCollection} */
  members;
  procedureName;
  /**
   * @param {Object} commandIL
   */
  constructor(commandIL) {
    super(commandIL);
    this.members = new MemberCollection(commandIL["Members"]);
    this.params = new ParamItemCollection(commandIL["Params"]);
    this.connectionName = TokenUtil.getFiled(commandIL, "ConnectionName");
    this.procedureName = TokenUtil.getFiled(commandIL, "ProcedureName");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    if (this.members?.length > 0) {
      const name = this.name.getValueAsync(context);
    }
    return VoidResult.result;
  }

  /**
   * @param {string} sourceName
   * @param {IContext} context
   */
  async #loadDataAsync(sourceName, context) {
    const connectionName = await this.connectionName.getValueAsync(context);
    const commandTask = this.toCustomFormatHtmlAsync(context);
  }

  /**
   * @param {IContext} context
   * @returns {Promise<string>}
   */
  async toCustomFormatHtmlAsync(context) {
    const tag = await this.createHtmlElementAsync(context);
    const paramsTag = tag.childs.indexOf((x) => x.name && x.name === "params");
    if (paramsTag) {
      tag.childs.splice(tag.childs.indexOf(paramsTag), 1);
    }
    return tag.getHtml();
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await Promise.all([
      tag.addAttributeIfExistAsync(
        "procedurename",
        this.procedureName,
        context
      ),
      tag.addAttributeIfExistAsync("source", this.connectionName, context),
    ]);
    if (this.extraAttributes) {
      Object.entries(this.extraAttributes).forEach(
        async (pair) =>
          await tag.addAttributeIfExistAsync(pair[0], pair[1], context)
      );
    }
    if ((this.params?.length ?? 0) > 0) {
      const paramsTag = new CommandElement("params");
      for (const pair of this.params) {
        const addTag = new CommandElement("add");
        await Promise.all([
          addTag.addAttributeIfExistAsync("name", pair.name, context),
          addTag.addAttributeIfExistAsync("value", pair.value, context),
        ]);
        paramsTag.addChild(addTag);
      }
      tag.addChild(paramsTag);
    }
    if (this.members) {
      for (const member of this.members) {
        tag.childs.push(await member.createHtmlElementAsync(context));
      }
    }
    return tag;
  }
}
