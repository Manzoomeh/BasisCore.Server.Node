import Request from "./request.js";
import RequestBaseResponse from "./requestBaseResponse.js";

export default class Index5Response extends RequestBaseResponse {
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
    return [
      parseInt(this._request.webserver.headercode.split(" ")[0]),
      {
        ...{ "content-type": this._request.webserver.mime },
        ...(this._request.webserver.gzip && {
          "Content-Encoding": "gzip",
        }),
        ...this._request.http,
      },
      this._request.cms.content,
    ];
  }
}
