export default class HostEndPoint {
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {Object.<string, any>} externalCommands
   */
  constructor(ip, port, externalCommands) {
    this._ip = ip;
    this._port = port;
    this._externalCommands = externalCommands
  }

  listen() {
    throw new Error("Not Implemented...");
  }
}
