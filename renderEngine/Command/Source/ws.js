import SourceCommand from "./BaseClasses/SourceCommand.js";
import ICommandResult from "../../Models/ICommandResult.js";
import VoidResult from "../../Models/VoidResult.js";
import IContext from "../../Context/IContext.js";
import DataSourceCollection from "../../Source/DataSourceCollection.js";
import WSMemberCollection from "./BaseClasses/WsMemberCollection.js";
import MemberCollection from "./BaseClasses/MemberCollection.js";
export default class WsCommand extends SourceCommand {
  /**
   * @param {object} wsIl
   */
  constructor(wsIl) {
    super(wsIl);
  }
  /**
   * @param {object[]} membersIl
   * @returns {MemberCollection}
   */
  createMemberCollection(membersIl) {
    return new WSMemberCollection(membersIl);
  }
  /**
   * @param {string} sourceName
   * @param {IContext} context
   * @returns {Promise<DataSourceCollection>}
   */
  async _loadDataAsync(sourceName, context) {
    const [connectionName, command] = await Promise.all([
      this.connectionName.getValueAsync(context),
      this.toCustomFormatHtmlAsync(context),
    ]);
    const inputs = {
      command,
      dmnid: context.domainId,
    };
    const encoder = new TextEncoder();
    const byteMessage = encoder.encode(JSON.stringify(inputs));
    const parameters = {
      byteMessage: byteMessage,
    };
    return await context.loadDataAsync(sourceName, connectionName, parameters);
  }
}
