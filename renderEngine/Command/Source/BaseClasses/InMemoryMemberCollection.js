import Member from "./Member.js";
import MemberCollection from "./MemberCollection.js";
import TableMember from "./TableMember.js";

export class InMemoryMemberCollection extends MemberCollection {
  /**
   * @param {object[]} membersIl
   */
  constructor(membersIl) {
    super(membersIl);
  }

  /**
   * @param {object} memberIl
   * @returns {Member}
   */
  _createMember(memberIl) {
    const type = memberIl["type"]?.toLowerCase() ?? "table";
    /** @type {Member} */
    let retVal = null;
    switch (type) {
      case "table": {
        retVal = new TableMember(memberIl);
        break;
      }
      default: {
        throw new Error("executeCommandAsync not implemented");
      }
    }
    return retVal;
  }
}
