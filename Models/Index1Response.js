import RequestBaseResponse from "./RequestBaseResponse.js";

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
    return [
      parseInt(this._request.cms.webserver.headercode.split(" ")[0]),
      {
        ...{ "content-type": this._request.cms.webserver.mime },
        ...(this._request.cms.webserver.gzip === "true" && {
          "Content-Encoding": "gzip",
        }),
        ...this._request.cms.http,
      },
      this._request.cms.cms.content,
    ];
  }
}
