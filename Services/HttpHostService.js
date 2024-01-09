import HostService from "./hostService.js";
import ServiceSettings from "../models/ServiceSettings.js";
import WebServerException from "../models/Exceptions/WebServerException.js";
import Request from "../models/request.js";

export class HttpHostService extends HostService {

  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   */
  constructor(name, options) {
    super(name, options);
    if (!this.settings.routerConnection) {
      throw new WebServerException(
        `Router connection not set in '${name}' http base host service!`
      );
    }
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async processAsync(request, fileContents) {
    try {
      await this._processUploadAsync(fileContents, request);
      const data = await this.settings.routerConnection.getRoutingDataAsync(
        request,
        null
      );
      return this._createResponse(data);
    } catch (er) {
      console.error(er);
      throw er;
    }
  }
}
