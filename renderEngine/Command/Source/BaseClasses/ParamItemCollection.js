import ParamItem from "./ParamItem.js";

export default class ParamItemCollection {
  /** @type {ParamItem[]} */
  items = [];
  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    if (Array.isArray(ilObject)) {
      ilObject.map((x) => this.items.push(new ParamItem(x)));
    }
  }
}
