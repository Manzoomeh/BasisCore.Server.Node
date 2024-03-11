import IContext from "../../../Context/IContext.js";
import VoidResult from "../../../Models/VoidResult.js";
import DataSourceCollection from "../../../Source/DataSourceCollection.js";
import IToken from "../../../Token/IToken.js";
import TokenUtil from "../../../Token/TokenUtil.js";
import CommandBase from "../../CommandBase.js";
import CommandElement from "../../CommandElement.js";
import MemberCollection from "./MemberCollection.js";
import ParamItemCollection from "./ParamItemCollection.js";
import BasisCoreException from "../../../../Models/Exceptions/BasisCoreException.js";

export default class SourceCommand extends CommandBase {
  /** @type {ParamItemCollection}   */
  params;
  connectionName;
  /**@type {MemberCollection} */
  members;
  procedureName;
  /**
   * @param {object} sourceCommandIl
   */
  constructor(sourceCommandIl) {
    super(sourceCommandIl);
    this.members = this.createMemberCollection(sourceCommandIl["Members"]);
    this.params = new ParamItemCollection(sourceCommandIl["Params"]);
    this.connectionName = TokenUtil.getFiled(sourceCommandIl, "ConnectionName");
    this.procedureName = TokenUtil.getFiled(sourceCommandIl, "ProcedureName");
  }

  /**
   * @param {object[]} ilObject
   * @returns {MemberCollection}
   */
  createMemberCollection(ilObject) {
    return new MemberCollection(ilObject);
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
        const source = dataSet.items[index++];
        await item.addDataSourceAsync(source, name, context);
      }
    }
    return VoidResult.result;
  }

  /**
   * @param {string} sourceName
   * @param {IContext} context
   * @returns {Promise<DataSourceCollection>}
   */
  async #loadDataAsync(sourceName, context) {
    const [connectionName, command, paramList] = await Promise.all([
      this.connectionName.getValueAsync(context),
      this.toCustomFormatHtmlAsync(context),
      this._getParamsAsync(context),
    ]);
    const params = {
      command,
      dmnid: 4235,
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
    if (paramsTag != -1) {
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
    if (this.params.IsNotNull) {
      await this.params.addHtmlElementAsync(tag, context);
    }
    if (this.members.IsNotNull) {
      await this.members.addHtmlElementAsync(tag, context);
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
