import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import RequestContext from "../renderEngine/Context/RequestContext.js";
import CommandUtil from "../test/command/CommndUtil.js";
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
      const commandIl = JSON.parse(this._request.cms.cms.content);
      const command = CommandUtil.createCommand(commandIl);
      const context = new RequestContext(this.settings);
      context.cancellation = new CancellationToken();
      var result = await command.executeAsync(context);
      var t = [];
      await result.writeAsync(t, context.cancellation);
      return [
        parseInt(this._request.cms.webserver.headercode.split(" ")[0]),
        {
          ...{ "content-type": this._request.cms.webserver.mime },
          ...(this._request.cms.webserver.gzip === "true" && {
            "Content-Encoding": "gzip",
          }),
          ...this._request.cms.http,
        },
        t.join(""),
      ];
    } catch (ex) {
      console.error(ex);
    }
  }
}
