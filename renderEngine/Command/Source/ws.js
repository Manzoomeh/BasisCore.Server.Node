import SourceCommand from "./BaseClasses/SourceCommand.js";
import ICommandResult from "../../Models/ICommandResult.js";
import VoidResult from "../../Models/VoidResult.js";
export default class WsCommand extends SourceCommand {
  /**
   * @param {object} wsIl
   */
  constructor(wsIl) {
    super(wsIl);
  }

  /**
   * @param {string} sourceName
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async #loadDataAsync(sourceName, context) {
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
  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    if (this.members?.items.length > 0) {
      const name = await this.name.getValueAsync(context);
      const dataSet = await this.#loadDataAsync(name, context);
      context.cancellation.throwIfCancellationRequested();
      if (dataSet.items.length != this.members.items.length) {
        throw new BasisCoreException(
          `Command ${name} has ${this.members.items.length} member(s) but ${dataSet.items.length} result(s) returned from source!`
        );
      }
      let index = 0;
      for (const item of this.members.items) {
        const source = dataSet.items[index++];
        await item.addDataSourceAsync(source, name, context);
      }
    }
    return VoidResult.result;
  }
}
