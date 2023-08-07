import fs from "fs";
import { StatusCodes } from "http-status-codes";
import Request from "./request.js";
import RequestBaseResponse from "./RequestBaseResponse.js";
import FileManagerBase from "../fileManager/fileManagerBase.js";

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
    if (FileManagerBase.getCurrent().exists(path)) {
      const content = await FileManagerBase.getCurrent().readFileAsync(path);
      return [
        parseInt(this._request.cms.webserver.headercode.split(" ")[0]),
        {
          ...{ "content-type": this._request.cms.webserver.mime },
          ...(this._request.cms.webserver.gzip == "true" && {
            "Content-Encoding": "gzip",
          }),
          ...(this._request.cms.webserver.etag && {
            ETag: this._request.cms.webserver.etag,
          }),
          ...(this._request.cms.webserver.lastmodified && {
            "Last-Modified": this._request.cms.webserver.lastmodified,
          }),
          ...(this._request.cms.http && this._request.cms.http),
        },
        content,
      ];
    } else {
      return [StatusCodes.NOT_FOUND, {}, null];
    }
  }
}
