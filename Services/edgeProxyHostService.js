import HostService from "./hostService.js";

class EdgeProxyHostService extends HostService {
  /**
   * @param {string} name
   * @param {number} ip
   * @param {string} port
   */
  constructor(name, ip, port) {
    super(name);
    this._ip = ip;
    this._port = port;
  }

  process(cms) {
    return cms;
  }
}

export default EdgeProxyHostService;
