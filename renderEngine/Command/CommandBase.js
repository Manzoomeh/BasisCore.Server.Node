import ICommandResult from "../Models/ICommandResult.js";
import IContext from "../Context/IContext.js";
import IToken from "../Token/IToken.js";
import ExceptionResult from "../Models/ExceptionResult.js";
import RunTypes from "../Enums/RunTypes.js";
import VoidResult from "../Models/VoidResult.js";
import TokenUtil from "../Token/TokenUtil.js";

export default class CommandBase {
  /**@type {string} */
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
   *
   * @param {object} commandIL
   */
  constructor(commandIL) {
    this.core = TokenUtil.getFiled(commandIL, "core");
    this.name = TokenUtil.getFiled(commandIL, "name");
    this.if = TokenUtil.getFiled(commandIL, "if");
    this.runType = TokenUtil.getFiled(commandIL, "runType");
    this.renderType = TokenUtil.getFiled(commandIL, "renderType");
    this.renderTo = TokenUtil.getFiled(commandIL, "renderTo");
    //TODO:Fill extra attribute
    this.extraAttributes = null;
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
      switch (runType) {
        case RunTypes.AtServer: {
          const ifValue = await this._getIfValueAsync(context);
          if (this.ifValue) {
            //TODO: create scope
            retVal = await this._executeCommandAsync(context);
          } else {
            retVal = VoidResult.result;
          }
          break;
        }
        case RunTypes.AtClient:
        case RunTypes.None: {
          break;
        }
        default: {
          retVal = VoidResult.result;
          break;
        }
      }
    } catch (ex) {
      retVal = new ExceptionResult(ex, context);
      //TODO: log error
    }
    return retVal;
  }

  /**
   *
   * @param {IContext} context
   * @returns {RunTypes}
   */
  async _getRunTypeValueAsync(context) {
    return (await this.runType.getValueAsync(context)) ?? RunTypes.AtServer;
  }

  /**
   *
   * @param {IContext} context
   * @returns {Boolean}
   */
  async _getIfValueAsync(context) {
    let retVal = false;
    try {
      retVal = eval(await this.if.getValueAsync(context));
    } catch {}
    return retVal;
  }

  /**
   *
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
}
