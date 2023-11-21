import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";
import CommandBase from "../CommandBase.js";

export default class CallCommand extends CommandBase {
  /** @type {IToken} */
  fileName;
  /**
   * @param {object} callCommandIl
   */
  constructor(callCommandIl) {
    super(callCommandIl);
    this.fileName = TokenUtil.getFiled(callCommandIl, "fileName");
  }
}
