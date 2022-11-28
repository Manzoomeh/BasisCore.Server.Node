import Request from "../models/request.js";
import Response from "../models/response.js";
export default class RequestDispatcher {
  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  processAsync(request) {
    throw new Error("Not implemented");
  }
}
