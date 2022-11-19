import fs from "fs";
import { StatusCodes } from "http-status-codes";
import Request from "./request.js";
import RequestBaseResponse from "./requestBaseResponse.js";

export default class Index2Response extends RequestBaseResponse {
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
    var path = this._request.cms.webserver.filepath;
    if (fs.existsSync(path)) {
      const content = await fs.promises.readFile(path);
      return [
        parseInt(this._request.cms.webserver.headercode.split(" ")[0]),
        { "content-type": this._request.cms.webserver.mime },
        content,
      ];
    } else {
      return [StatusCodes.NOT_FOUND, {}, null];
    }
  }
}
