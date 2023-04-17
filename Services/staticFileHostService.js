import path from "path";
import HostService from "./hostService.js";
import Request from "../models/request.js";
import Response from "../models/response.js";
import FileResponse from "../models/fileResponse.js";
import { HostServiceOptions } from "../models/model.js";

export default class StaticFileProxyHostService extends HostService {
  /** @type {string} */
  #rootPath;
  /**
   * @param {string} name
   * @param {string} rootPath
   * @param {HostServiceOptions} options
   */
  constructor(name, rootPath, options) {
    super(name, options);
    this.#rootPath = rootPath;
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async processAsync(request, fileContents) {
    await this._processUploadAsync(fileContents, request);
    let url = request.Url;
    if (url == "") {
      url = "index.html";
    }
    return new FileResponse(path.join(this.#rootPath, url));
  }
}
