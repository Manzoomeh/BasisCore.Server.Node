import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import RequestContext from "../renderEngine/Context/RequestContext.js";
import CommandUtil from "../test/command/CommandUtil.js";
import RequestBaseResponse from "./requestBaseResponse.js";

export default class Index1Response extends RequestBaseResponse {
  /**
   * @param {Request} request
   */
  constructor(request) {
    super(request);
  }

  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync() {
    try {
      const commandIl = JSON.parse(this._request.cms.page_il);
      const command = CommandUtil.createCommand(commandIl);
      const context = new RequestContext(this.settings);
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
        },
        renderResultList.join(""),
      ];
    } catch (ex) {
      console.error(ex);
    }
  }
}
