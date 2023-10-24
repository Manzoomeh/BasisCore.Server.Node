import Member from "./Member.js";

export default class MemberCollection {
  /** @type {Member[]} */
  items = [];
  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    if (Array.isArray(ilObject)) {
      ilObject.map((x) => this.items.push(new Member(x)));
    }
  }
}
