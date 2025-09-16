import Member from "./Member.js";
import MemberCollection from "./MemberCollection.js";
import WsMember from "./WsMember.js";

export default class WSMemberCollection extends MemberCollection {
  /** @param {object[]} membersIl */
  constructor(membersIl) {
    super(membersIl);
  }

  /**
   * @param {object} memberIl
   * @returns {Member}
   */
  _createMember(memberIl) {
    return new WsMember(memberIl);
  }
}
