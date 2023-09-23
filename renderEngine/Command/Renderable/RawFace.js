import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";

export default class RawFace {
  /**@type {IToken} */
  applyReplace;
  /**@type {IToken} */
  applyFunction;
  /**@type {IToken} */
  level;
  /**@type {IToken} */
  rowType;
  /**@type {IToken} */
  filter;
  /**@type {IToken} */
  template;

  constructor(ilObject) {
    this.applyReplace = TokenUtil.getFiled(ilObject, "replace");
    this.applyFunction = TokenUtil.getFiled(ilObject, "function");
    this.level = TokenUtil.getFiled(ilObject, "level");
    this.rowType = TokenUtil.getFiled(ilObject, "row-type");
    this.filter = TokenUtil.getFiled(ilObject, "filter");
    this.template = TokenUtil.getFiled(ilObject, "template");
  }
}
