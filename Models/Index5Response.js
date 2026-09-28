import IRoutingRequest from "./IRoutingRequest.js";
import RequestBaseResponse from "./RequestBaseResponse.js";

export default class Index5Response extends RequestBaseResponse {
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
    const responseHeaders = {
      ...{ "content-type": this._request.webserver.mime },
      ...(this._request.webserver.gzip && {
        "Content-Encoding": "gzip",
      }),
      ...this._request.http,
    };

    let responseBody = this._request.cms.content;
    if ((responseBody === undefined || responseBody === null) && typeof this._request.cms["blob-content"] === "string") {
      responseBody = Buffer.from(this._request.cms["blob-content"], "base64");
    }

    const normalizedHeaderKey = Object.keys(responseHeaders).find(
      (key) => key.toLowerCase() === "content-length"
    );
    const contentLengthKey = normalizedHeaderKey || "Content-Length";

    if (Buffer.isBuffer(responseBody)) {
      responseHeaders[contentLengthKey] = String(responseBody.length);
    } else if (typeof responseBody === "string") {
      responseHeaders[contentLengthKey] = String(Buffer.byteLength(responseBody));
    } else if (responseBody === undefined || responseBody === null) {
      delete responseHeaders[contentLengthKey];
      responseBody = "";
    }

    return [
      parseInt(this._request.webserver.headercode.split(" ")[0]),
      responseHeaders,
      responseBody,
    ];
  }
}
