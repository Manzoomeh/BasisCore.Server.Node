import Member from "./Member.js";

export default class MemberCollection extends Array {
  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    super();
    if (Array.isArray(ilObject)) {
      ilObject.map((x) => this.push(new Member(x)));
    }
  }
}
