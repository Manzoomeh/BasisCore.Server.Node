import ICommandResult from "../Models/ICommandResult.js";
import IContext from "../Context/IContext.js";
import IToken from "../Token/IToken.js";
import ExceptionResult from "../Models/ExceptionResult.js";
import RunTypes from "../Enums/RunTypes.js";
import VoidResult from "../Models/VoidResult.js";
import TokenUtil from "../Token/TokenUtil.js";
import CommandElement from "./CommandElement.js";
import StringResult from "../Models/StringResult.js";

function normalizeLegacyIfExpression(expression) {
  return String(expression ?? "").replace(
    /((?:'[^']*'|"[^"]*"|`[^`]*`|[^\s()]+))\s+in\s*\(([^()]+)\)/gi,
    (_, left, values) =>
      `[${values}].map(function(item){ return String(item); }).includes(String(${left}))`
  );
}

async function resolveLegacyClientIfTokens(expression, context) {
  const tokenPattern = /\{##([\s\S]*?)##\}/g;
  let result = "";
  let lastIndex = 0;
  let match;

  while ((match = tokenPattern.exec(String(expression))) !== null) {
    result += String(expression).slice(lastIndex, match.index);

    const tokenBody = match[1].trim();
    const fallbackMatch = tokenBody.match(/\|\s*\(([\s\S]*)\)\s*$/);
    const reference = (
      fallbackMatch ? tokenBody.slice(0, fallbackMatch.index) : tokenBody
    ).trim();
    const referenceParts = reference.split(".");

    // Leave unknown client expressions untouched so the normal validation
    // path reports them as false instead of resolving the wrong source.
    if (referenceParts.length < 3) {
      result += match[0];
      lastIndex = tokenPattern.lastIndex;
      continue;
    }

    const params = [
      {
        Source: referenceParts[0],
        Member: referenceParts[1],
        Column: referenceParts.slice(2).join("."),
      },
    ];
    if (fallbackMatch) {
      params.push({ Value: fallbackMatch[1].trim() });
    }

    const resolvedValue = await TokenUtil.ToToken({ Params: params }).getValueAsync(
      context
    );
    result += resolvedValue ?? "";
    lastIndex = tokenPattern.lastIndex;
  }

  return result + String(expression).slice(lastIndex);
}

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
  /**@type {IToken} */
  method;
  /** @type {NodeJS.Dict<IToken>} */
  extraAttributes;
  /** @type {IToken} */
  datamembername

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
    this.method = TokenUtil.getFiled(commandIl, "method");
    this.datamembername = TokenUtil.getFiled(commandIl, "data-member-name");
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
    const commandStep = context.debugContext.newStep(`Execute ${await this.core.getValueAsync()}`);
    try {
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
            // Client commands can reference sources that are created only after
            // BasisCore starts in the browser. Preserve those bindings instead
            // of waiting for a source that cannot exist on the server.
            const clientContext = context.createContext("atclient-render");
            clientContext.preserveUnresolvedClientBindings = true;
            retVal = new StringResult(
              (await this.createHtmlElementAsync(clientContext)).getHtml()
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
      commandStep.complete();
      return retVal;
    } catch (err) {
      commandStep.failed();
    }
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
    let value = null;
    try {
      value = await this.if.getValueAsync(context);
      if (value) {
        let regex = /(?<!=[<>=!])=(?!=)|<>/g;
        const resolvedExpression = await resolveLegacyClientIfTokens(
          value,
          context
        );
        const expression = normalizeLegacyIfExpression(resolvedExpression).replace(
          regex,
          (match) => {
            if (match === "=") {
              return "==";
            } else if (match === "<>") {
              return "!=";
            }
          }
        );
        retVal = eval(expression);
      } else {
        retVal = true;
      }
    } catch (error) {
      console.warn("basis if expression evaluated as false", {
        value,
        error: String(error?.message || error || ""),
      });
    }
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
      tag.addAttributeIfExistAsync("method", this.method, context),
      tag.addAttributeIfExistAsync("datamembername",this.datamembername,context)
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
