import VoidResult from "../../Models/VoidResult.js";
import { InMemoryMemberCollection } from "./BaseClasses/InMemoryMemberCollection.js";
import SourceCommand from "./BaseClasses/SourceCommand.js";
import IToken from "../../Token/IToken.js";
import ICommandResult from "../../Models/ICommandResult.js";
import IContext from "../../Context/IContext.js";
export default class InlineSourceCommand extends SourceCommand {
  /**
   * @param {object} inlineSourceIl
   */
  constructor(inlineSourceIl) {
    super(inlineSourceIl);
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
      const name = await this.name.getValueAsync(context);
      await Promise.all(
        this.members.items.map((x) => x.addDataSourceAsync(name, context))
      );
    }
    return VoidResult.result;
  }
}
