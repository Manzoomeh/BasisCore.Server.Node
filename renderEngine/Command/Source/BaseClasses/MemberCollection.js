import Member from "./Member.js";

export default class MemberCollection {
  /** @type {Member[]} */
  items = [];
  /**
   * @param {object[]} memberIl
   */
  constructor(memberIl) {
    if (Array.isArray(memberIl)) {
      memberIl.map((x) => this.items.push(this._createMember(x)));
    }
  }

  /**
   * @param {object} ilObject
   * @returns {Member}
   */
  _createMember(ilObject) {
    return new Member(ilObject);
  }
}
