import IContext from "../../Context/IContext.js";
import GroupResult from "../../Models/GroupResult.js";
import JsonSource from "../../Source/JsonSource.js";
import TokenUtil from "../../Token/TokenUtil.js";
import CollectionCommand from "./CollectionCommand.js";

export default class RepeaterCommand extends CollectionCommand {
  /**@type {IToken} */
  sourceId;

  /**
   * @param {object} repeaterCommandIl
   * @param {Object.<string, any>} externalCommands
   */
  constructor(repeaterCommandIl,externalCommands) {
    super(repeaterCommandIl,externalCommands);
    this.sourceId = TokenUtil.getFiled(repeaterCommandIl, "data-member-name");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<GroupResult>}
   */
  async _executeCommandAsync(context) {
    const mainSource = await context.waitToGetSourceAsync(
      await this.sourceId.getValueAsync()
    );
    const results = [];
    const name = await this.name.getValueAsync();
    for (const row of mainSource.data) {
      let newContext = context.createContext("repeater");
      newContext.addSource(new JsonSource([row], `${name}.current`));
      const result = await this.executeCommandBlocks(newContext);
      results.push(...result);
    }
    return new GroupResult(results);
  }
}
