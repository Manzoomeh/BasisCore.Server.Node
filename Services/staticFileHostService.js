import path from "path";
import HostService from "./hostService.js";
import Request from "../Models/request.js";
import Response from "../Models/Response.js";
import FileResponse from "../Models/FileResponse.js";

class StaticFileProxyHostService extends HostService {
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
   * @returns {Response}
   */
  process(request) {
    var url = request.Url;
    if (url == "") {
      url = "index.html";
    }
    return new FileResponse(path.join(this.#rootPath, url));
  }
}

export default StaticFileProxyHostService;
