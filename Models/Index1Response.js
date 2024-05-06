import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import RequestContext from "../renderEngine/Context/RequestContext.js";
import CommandUtil from "../renderEngine/CommandUtil.js";
import IRoutingRequest from "./IRoutingRequest.js";
import ServiceSettings from "./ServiceSettings.js";
import RequestBaseResponse from "./requestBaseResponse.js";

export default class Index1Response extends RequestBaseResponse {
  /**@type {Object.<string, any>}*/
  _externalCommands;
  /**
   * @param {IRoutingRequest} request
   * @param {ServiceSettings} settings
   * @param {Object.<string, any>} externalCommands
   */
  constructor(request, settings, externalCommands) {
    super(request, settings);
  }

  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync() {
    try {
      const commandIl = JSON.parse(this._request.cms.page_il);
      const command = CommandUtil.createCommand(
        commandIl,
        this._externalCommands
      );
      const context = new RequestContext(
        this._settings,
        this._request,
        this._externalCommands
      );
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
