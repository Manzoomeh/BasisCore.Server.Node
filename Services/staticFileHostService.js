import HostService from "./hostService.js";

class StaticFileProxyHostService extends HostService {
  /**
   * @param {string} name
   * @param {string} rootPath
   */
  constructor(name, rootPath) {
    super(name);
    this._rootPath = rootPath;
  }

  processAsync(cms) {
    return cms;
  }
}

export default StaticFileProxyHostService;
