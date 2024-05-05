export default class HostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port) {
    this._ip = ip;
    this._port = port;
  }

  listen() {
    throw new Error("Not Implemented...");
  }
}
