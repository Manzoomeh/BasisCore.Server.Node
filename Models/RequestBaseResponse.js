import IRoutingRequest from "./IRoutingRequest.js";
import Response from "./response.js";

export default class RequestBaseResponse extends Response {
  /**@type {IRoutingRequest} request */
  _request;
  /** @type {ServiceSettings}  setting*/
  _settings;
  /**
   * @param {IRoutingRequest} request
   */
  /** @param {ServiceSettings} settings*/

  constructor(request, settings) {
    super();
    this._request = request;
    this._settings = settings
  }
}
