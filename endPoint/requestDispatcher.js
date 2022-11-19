import Request from "../Models/Request.js";
import Response from "../Models/Response.js";
export default class RequestDispatcher {
  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  processAsync(request) {
    throw new Error("Not implemented");
  }
}
