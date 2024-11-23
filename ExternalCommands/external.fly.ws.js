import SourceCommand from "./../renderEngine/Command/Source/BaseClasses/SourceCommand.js";
import ICommandResult from "./../renderEngine/Models/ICommandResult.js";
export default class FlyCommand extends SourceCommand {
  /**
   * @param {object} flyIl
   */
  constructor(flyIl) {
    super(flyIl);
  }

  /**
   * @param {string} sourceName
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
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
      byteMessage,
    };
    return await context.loadDataAsync(sourceName, connectionName, parameters);
  }
}
