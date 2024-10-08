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

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    return this.items.length > 0;
  }

  /**
   * @param {CommandElement} ownerTag
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async addHtmlElementAsync(ownerTag, context) {
    const elements = await Promise.all(
      this.items.map((x) => x.createHtmlElementAsync(context))
    );
    elements.forEach((x) => ownerTag.addChild(x));
  }
}
