import Request from "../Models/request.js";
import Response from "../Models/Response.js";
class RequestDispatcher {
  /**
   *
   * @param {Request} request
   * @returns {Response}
   */
  process(request) {
    throw new Error("Not implemented");
  }
}

export default RequestDispatcher;
