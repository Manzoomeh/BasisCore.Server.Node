import fs from "fs";
import { StatusCodes } from "http-status-codes";
import RequestBaseResponse from "./RequestBaseResponse.js";
import IRoutingRequest from "./IRoutingRequest.js";

export default class Index2Response extends RequestBaseResponse {
  /**
   * @param {IRoutingRequest} request
   */
  constructor(request,setting) {
    super(request,setting);
  }
  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync() {
    const rawPath = this._request.webserver.filepath;
    const resolvedFile = this._resolveFilesystemPath(rawPath, {
      includeZipFallback: true,
    });
    const filePath = resolvedFile.path;
    if (resolvedFile.exists) {
      const content = await fs.promises.readFile(filePath);
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
