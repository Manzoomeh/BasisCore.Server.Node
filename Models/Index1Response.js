import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import RequestContext from "../renderEngine/Context/RequestContext.js";
import CommandUtil from "../renderEngine/CommandUtil.js";
import IRoutingRequest from "./IRoutingRequest.js";
import ServiceSettings from "./ServiceSettings.js";
import RequestBaseResponse from "./requestBaseResponse.js";

export default class Index1Response extends RequestBaseResponse {
  /**
   * @param {IRoutingRequest} request
   * @param {ServiceSettings} settings
   */
  constructor(request, settings) {
    super(request, settings);
  }

  /**
   * @param {Object.<string, any>} externalCommands
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync(externalCommands) {
    try {
      const commandIl = JSON.parse(this._request.cms.page_il);
      const command = CommandUtil.createCommand(commandIl, externalCommands);
      const context = new RequestContext(this._settings, this._request,externalCommands);
      context.cancellation = new CancellationToken();
      const result = await command.executeAsync(context);
      const renderResultList = [];
      await result.writeAsync(renderResultList, context.cancellation);
      return [
        parseInt(this._request.webserver.headercode.split(" ")[0]),
        {
          ...{ "content-type": this._request.webserver.mime },
          ...(this._request.webserver.gzip === "true" && {
            "Content-Encoding": "gzip",
          }),
          ...this._request.http,
          ...(context._cookies &&
            Object.fromEntries(
              context._cookies.map((x) => x.toHttpHeaderField())
            )),
        },
        renderResultList.join(""),
      ];
    } catch (ex) {
      console.error(ex);
    }
  }
}
