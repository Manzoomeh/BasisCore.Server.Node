import ParamItem from "./ParamItem.js";

export default class ParamItemCollection extends Array {
  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    super();
    if (Array.isArray(ilObject)) {
      ilObject.map((x) => this.push(new ParamItem(x)));
    }
  }
}
