import IContext from "../Context/IContext.js";
import CommandBase from "./CommandBase.js";
import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";
import IToken from "../Token/IToken.js";
import TokenUtil from "../Token/TokenUtil.js";
import ContextBase from "../Context/ContextBase.js";
import VoidResult from "../Models/VoidResult.js";

export default class ScriptCommand extends CommandBase {
  constructor(scriptIL) {
    super(scriptIL);
    /*** @type {IToken}*/
    this.language = TokenUtil.getFiled(scriptIL, "language");
    /*** @type {IToken}*/
    this.content = TokenUtil.getFiled(scriptIL, "content");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    switch (this.language.value.toLowerCase()) {
      case "javascript":
        this.findJsFunctions(context);
        break;
      default:
        throw new BasisCoreException(
          `Invalid language for tag script; script is not supported in ${this.language}`
        );
    }
    return VoidResult.result;
  }
  /**
   *
   * @param {string,context} jsScript
   * @param {*} context
   */
  findJsFunctions(context) {
    // Named Function Declaration
    const regexNamedFunction =
      /function\s+([a-zA-Z_$][\w$]*)\s*\(([^)]*)\)\s*{([^]*?)}/g;

    // Anonymous Function Declaration
    const regexAnonymousFunction = /function\s*\(([^)]*)\)\s*{([^]*?)}/g;
    const regexArrowFunctionWithParenBlock =
      /const\s*([a-zA-Z_$][\w$]*)\s*=\s*\(([^)]*)\)\s*=>\s*{([^]*?)}/g;
    // Function Expression
    const regexFunctionExpression =
      /let\s*([a-zA-Z_$][\w$]*)\s*=\s*function\s*\(([^)]*)\)\s*{([^]*?)}/g;

    this.extractFunctions(regexNamedFunction, this.content.value, context);
    this.extractFunctions(regexAnonymousFunction, this.content.value, context);
    this.extractFunctions(
      regexArrowFunctionWithParenBlock,
      this.content.value,
      context
    );
    this.extractFunctions(regexFunctionExpression, this.content.value, context);
  }
  /**
   *
   * @param {RegExp} regex
   * @param {string} code
   * @param {IContext} context
   * @returns void
   */
  extractFunctions(regex, code, context) {
    let match;
    while ((match = regex.exec(code)) !== null) {
      const functionName = match[1];
      const parameters = match[2];
      const functionCode = match[3];
      const finalFunction = new Function(
        ...parameters.split(","),
        functionCode
      );
      context.addFunction(functionName, finalFunction);
    }
  }
}
