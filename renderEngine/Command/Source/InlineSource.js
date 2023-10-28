import VoidResult from "../../Models/VoidResult.js";
import { InMemoryMemberCollection } from "./BaseClasses/InMemoryMemberCollection.js";
import SourceCommand from "./BaseClasses/SourceCommand.js";

export default class InlineSource extends SourceCommand {
  /**
   * @param {Object} commandIl
   */
  constructor(commandIl) {
    super(commandIl);
  }

  /**
   * @param {object[]} membersIl
   * @returns {MemberCollection}
   */
  createMemberCollection(membersIl) {
    return new InMemoryMemberCollection(membersIl);
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    if ((this.members?.items.length ?? 0) > 0) {
      const name = this.name.getValueAsync(context);
      await Promise.all(
        this.members.items.map((x) => x.addDataSourceAsync(name, context))
      );
    }
    return VoidResult.result;
  }
}
