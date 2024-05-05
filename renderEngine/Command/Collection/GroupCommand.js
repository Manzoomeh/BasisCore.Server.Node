import IContext from "../../Context/IContext.js";
import GroupResult from "../../Models/GroupResult.js";
import CollectionCommand from "./CollectionCommand.js";

export default class GroupCommand extends CollectionCommand {
  /**
   * @param {object} groupCommandIl
   * @param {Object.<string, any>} externalCommands
   */
  constructor(groupCommandIl) {
    super(groupCommandIl);
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const newContext = context.createContext("group");
    const result = await this.executeCommandBlocks(newContext);
    return new GroupResult(result);
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    const childTags = await Promise.all(
      this.commands.map((x) => x.createHtmlElementAsync(context))
    );
    childTags.forEach((childTag) => {
      tag.addChild(childTag);
    });
    return tag;
  }
}
