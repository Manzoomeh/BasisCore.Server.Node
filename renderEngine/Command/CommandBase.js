import ICommandResult from "../Models/ICommandResult.js";
import IContext from "../Context/IContext.js";
import IToken from "../Token/IToken.js";
import ExceptionResult from "../Models/ExceptionResult.js";
import RunTypes from "../Enums/RunTypes.js";
import VoidResult from "../Models/VoidResult.js";
import TokenUtil from "../Token/TokenUtil.js";
import CommandElement from "./CommandElement.js";
import StringResult from "../Models/StringResult.js";

export default class CommandBase {
  /**@type {IToken} */
  core;
  /**@type {IToken} */
  name;
  /**@type {IToken} */
  if;
  /**@type {IToken} */
  runType;
  /**@type {IToken} */
  renderTo;
  /**@type {IToken} */
  renderType;
  /** @type {NodeJS.Dict<IToken>} */
  extraAttributes;

  /**
   * @param {object} commandIl
   */
  constructor(commandIl) {
    this.core = TokenUtil.getFiled(commandIl, "core");
    this.name = TokenUtil.getFiled(commandIl, "name");
    this.if = TokenUtil.getFiled(commandIl, "if");
    this.runType = TokenUtil.getFiled(commandIl, "run");
    this.renderType = TokenUtil.getFiled(commandIl, "renderType");
    this.renderTo = TokenUtil.getFiled(commandIl, "renderTo");
    this.extraAttributes = null;
    /**@type {NodeJS.Dict?} */
    const items = commandIl["extra-attribute"];
    if (items) {
      this.extraAttributes = {};
      Object.entries(items).map(
        (pair) =>
          (this.extraAttributes[pair[0]] = pair[1]
            ? TokenUtil.ToToken(pair[1])
            : ValueToken.Null)
      );
    }
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async executeAsync(context) {
    /** @type {ICommandResult?} */
    let retVal = null;
    try {
      const runType = await this._getRunTypeValueAsync(context);
      switch (runType.toLowerCase()) {
        case RunTypes.AtServer: {
          const ifValue = await this._getIfValueAsync(context);
          if (ifValue) {
            //TODO: create scope
            retVal = await this._executeCommandAsync(context);
          } else {
            retVal = VoidResult.result;
          }
          break;
        }
        case RunTypes.AtClient:
        case RunTypes.None: {
          retVal = new StringResult(
            (await this.createHtmlElementAsync(context)).getHtml()
          );
          break;
        }
        default: {
          retVal = VoidResult.result;
          break;
        }
      }
    } catch (ex) {
      console.error(ex);
      retVal = new ExceptionResult(ex, context);
      //TODO: log error
    }
    return retVal;
  }

  /**
   *
   * @param {IContext} context
   * @returns {Promise<RunTypes>}
   */
  async _getRunTypeValueAsync(context) {
    return (await this.runType.getValueAsync(context)) ?? RunTypes.AtServer;
  }

  /**
   *
   * @param {IContext} context
   * @returns {Promise<Boolean>}
   */
  async _getIfValueAsync(context) {
    let retVal = false;
    try {
      const value = await this.if.getValueAsync(context);
      if (value) {
        retVal = eval(value);
      } else {
        retVal = true;
      }
    } catch {}
    return retVal;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    return Promise.resolve(
      new ExceptionResult(
        new Error("executeCommandAsync not implemented"),
        context
      )
    );
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = new CommandElement("basis");
    await Promise.all([
      tag.addAttributeIfExistAsync("core", this.core, context),
      tag.addAttributeIfExistAsync("name", this.name, context),
      tag.addAttributeIfExistAsync("if", this.if, context),
      tag.addAttributeIfExistAsync("renderto", this.renderTo, context),
      tag.addAttributeIfExistAsync("rendertype", this.renderType, context),
    ]);
    if (this.runType) {
      const runType = await this._getRunTypeValueAsync(context);
      if (runType != RunTypes.None) {
        tag.addAttributeIfExist("run", runType);
      }
    }
    if (this.extraAttributes) {
      await Promise.all(
        Object.entries(this.extraAttributes).map((pair) =>
          tag.addAttributeIfExistAsync(pair[0], pair[1], context)
        )
      );
    }
    return tag;
  }
}
