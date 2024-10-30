import IContext from "../../Context/IContext.js";
import GroupResult from "../../Models/GroupResult.js";
import CollectionCommand from "./CollectionCommand.js";

export default class GroupCommand extends CollectionCommand {
  /**
   * @param {object} groupCommandIl
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
    this.commands = this.commandsObjects.map((x) => context.createCommand(x));
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
