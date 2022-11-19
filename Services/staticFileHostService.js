import path from "path";
import HostService from "./hostService.js";
import Request from "../Models/Request.js";
import Response from "../Models/Response.js";
import FileResponse from "../Models/FileResponse.js";

export default class StaticFileProxyHostService extends HostService {
  /** @type {string} */
  #rootPath;
  /**
   * @param {string} name
   * @param {string} rootPath
   */
  constructor(name, rootPath) {
    super(name);
    this.#rootPath = rootPath;
  }

  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  processAsync(request) {
    var url = request.Url;
    if (url == "") {
      url = "index.html";
    }
    return Promise.resolve(new FileResponse(path.join(this.#rootPath, url)));
  }
}
