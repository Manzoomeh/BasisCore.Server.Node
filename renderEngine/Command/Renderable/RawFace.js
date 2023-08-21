import TokenUtil from "../../Token/TokenUtil";

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
    this.rowType = TokenUtil.getFiled(ilObject, "rowType");
    this.filter = TokenUtil.getFiled(ilObject, "filter");
    this.template = TokenUtil.getFiled(ilObject, "content");
  }
}
