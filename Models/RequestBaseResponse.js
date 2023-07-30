import Request from "./request.js";
import Response from "./Response.js";

export default class RequestBaseResponse extends Response {
  /**@type {Request} request */
  _request;
  /**
   * @param {Request} request
   */
  constructor(request) {
    super();
    this._request = request;
  }
}
