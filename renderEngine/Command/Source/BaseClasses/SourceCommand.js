import BasisCoreException from "../../../../models/Exceptions/BasisCoreException.js";
import IContext from "../../../Context/IContext.js";
import VoidResult from "../../../Models/VoidResult.js";
import DataSourceCollection from "../../../Source/DataSourceCollection.js";
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
    this.connectionName = TokenUtil.getFiled(commandIL, "source");
    this.procedureName = TokenUtil.getFiled(commandIL, "ProcedureName");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    if (this.members?.items.length > 0) {
      const name = await this.name.getValueAsync(context);
      const dataSet = await this.#loadDataAsync(name, context);
      context.cancellation.throwIfCancellationRequested();
      if (dataSet.items.length != this.members.items.length) {
        throw new BasisCoreException(
          `Command ${name} has ${this.members.items.length} member(s) but ${dataSet.items.length} result(s) returned from source!`
        );
      }
      let index = 0;
      for (const item of this.members.items) {
        var source = dataSet.items[index++];
        await item.addDataSourceAsync(source, name, context);
      }
      console.dir(set);
    }
    return VoidResult.result;
  }

  /**
   * @param {string} sourceName
   * @param {IContext} context
   * @returns {Promise<DataSourceCollection>}
   */
  async #loadDataAsync(sourceName, context) {
    //const connectionName = await this.connectionName.getValueAsync(context);
    //const commandTask = this.toCustomFormatHtmlAsync(context);

    const [connectionName, command, paramList] = await Promise.all([
      this.connectionName.getValueAsync(context),
      this.toCustomFormatHtmlAsync(context),
      this._getParamsAsync(context),
    ]);
    const params = {
      command,
      dmnid: context.domainId,
      params: paramList,
    };
    return await context.loadDataAsync(sourceName, connectionName, params);
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
      for (const pair of this.params.items) {
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
      for (const member of this.members.items) {
        tag.childs.push(await member.createHtmlElementAsync(context));
      }
    }
    return tag;
  }

  /**
   *
   * @param {IContext} context
   * @returns {Promise<NodeJS.Dict<string>>}
   */
  async _getParamsAsync(context) {
    const retVal = {};
    for (const item of this.params.items) {
      const [name, value] = await Promise.all([
        item.name instanceof IToken
          ? await item.name.getValueAsync(context)
          : item.name,
        item.value instanceof IToken
          ? await item.value.getValueAsync(context)
          : item.value,
      ]);
      retVal[name] = value;
    }
    return retVal;
  }
}
