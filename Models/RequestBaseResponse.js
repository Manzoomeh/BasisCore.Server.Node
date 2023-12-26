import IRoutingRequest from "./IRoutingRequest.js";
import Response from "./response.js";

export default class RequestBaseResponse extends Response {
  /**@type {IRoutingRequest} request */
  _request;
  /**
   * @param {IRoutingRequest} request
   */
  constructor(request) {
    super();
    this._request = request;
  }
}
