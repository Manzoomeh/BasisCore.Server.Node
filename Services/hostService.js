import { RequestDispatcher } from "../endPoint/endPoints.js";
import Request from "../Models/request.js";
import Response from "../Models/Response.js";

class HostService extends RequestDispatcher {
  /**
   * @param {string} name
   */
  constructor(name) {
    super();
    this._name = name;
  }

  /**
   * @param {Request} request
   * @returns {Response}
   */
  process(request) {
    throw new Error("Not implemented!");
  }
}

export default HostService;
