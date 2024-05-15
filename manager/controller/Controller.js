import fs from "fs";
import HostManager from "../../hostManager.js";
import {
  HostEndPointOptions,
  HostManagerOptions,
  HostServiceOptions,
} from "../../models/model.js";
/**
 * @typedef Config
 * @property {string} _ip
 * @property {string} _port
 */
export default class Controller {
  /** @type {HostManagerOptions} */
  config;
  /** @type {HostManager} */
  hostManager;

  constructor() {
    this.configPath =
      process.env.HOST_ADDRESS ||
      `F:\\AliBazregar\\BasisCore.Server.Node\\manager\\hosts.json`;
    this.config = JSON.parse(fs.readFileSync(this.configPath));
    this.hostManager = HostManager.fromJson(this.config);
    this.hostManager.listen();
  }
  /**
   * @param {string} name
   * @param {HostEndPointOptions} endPoint
   * @param {HostServiceOptions} services
   * @returns {Promise<void>}
   */
  async _addEndPoint(name, endPoint, services) {
    this.hostManager.addHost(name, endPoint, services);
    this.config.EndPoints[name] = endPoint;
    this.config.Services[endPoint.Routing] = services;
    await this.#saveConfig();
  }
  async #saveConfig() {
    await fs.promises.writeFile(this.configPath, JSON.stringify(this.config));
  }
  async _deleteEndPoint(name) {
    let mustRemoveEndPoints = [];
    console.log(this.config.EndPoints, name);
    if (this.config.EndPoints[name]) {
      /**@type {Config[]} */
      this.config.EndPoints[name].Addresses.forEach((address) => {
        let [ip, port] = address.EndPoint.split(":");
        mustRemoveEndPoints.push({
          _ip: ip,
          _port: port,
        });
      });
      delete this.config.EndPoints[name];
    } else {
      throw new Error("the endPoint not found");
    }
    await this.#saveConfig();
    this.hostManager.stopHost(name,mustRemoveEndPoints);
  }
}
