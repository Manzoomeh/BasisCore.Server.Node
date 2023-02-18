import Index2Response from "../models/index2Response.js";
import Index5Response from "../models/index5Response.js";
import Index1Response from "../Models/Index1Response.js";
import Request from "../models/request.js";
import Response from "../models/response.js";

export default class HostService {
  /**@type {string} */
  name;

  /**
   * @param {string} name
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  processAsync(request) {
    throw new Error("Not implemented!");
  }

  /**
   * @param {Request} request
   * @returns {Response}
   */
  _createResponse(request) {
    /**@type {Response} */
    let retVal = null;
    switch (request.cms.webserver.index) {
      case "1": {
        retVal = new Index1Response(request);
        break;
      }
      case "2": {
        retVal = new Index2Response(request);
        break;
      }
      case "4": {
        retVal = new Index2Response(request);
        break;
      }
      case "5": {
        retVal = new Index5Response(request);
        break;
      }
      default: {
        throw new Error(
          `index type '${request.cms.webserver.index}' not supported in this version of web server.`
        );
      }
    }
    return retVal;
  }
}
