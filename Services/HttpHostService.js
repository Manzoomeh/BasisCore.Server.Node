import HostService from "./hostService.js";
import ServiceSettings from "../models/ServiceSettings.js";

export class HttpHostService extends HostService {
  /** @type {ServiceSettings} */
  settings;
  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   */
  constructor(name, options) {
    super(name, options);
    this.settings = new ServiceSettings(options);
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
      console.log(data);
      return this._createResponse({
        cms: data,
      });
    } catch (er) {
      console.error(er);
      throw er;
    }
  }
}
