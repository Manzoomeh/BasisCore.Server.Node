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
    var path = this._request.webserver.filepath;
    if (fs.existsSync(path)) {
      const content = await fs.promises.readFile(path);
      return [
        parseInt(this._request.webserver.headercode.split(" ")[0]),
        {
          ...{ "content-type": this._request.webserver.mime },
          ...(this._request.webserver.gzip == "true" && {
            "Content-Encoding": "gzip",
          }),
          ...(this._request.webserver.etag && {
            ETag: this._request.webserver.etag,
          }),
          ...(this._request.webserver.lastmodified && {
            "Last-Modified": this._request.webserver.lastmodified,
          }),
          ...(this._request.http && this._request.http),
        },
        content,
      ];
    } else {
      return [StatusCodes.NOT_FOUND, {}, null];
    }
  }
}
