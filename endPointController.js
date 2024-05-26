import Controller from "./manager/controller/Controller.js";
import HostManager from "./hostManager.js";
import fs from "fs";
import HostManager from "./hostManager.js";
import {
  HostEndPointOptions,
  HostManagerOptions,
  HostServiceOptions,
} from "./models/model.js";

class EndPointController {
  /** @type {HostManagerOptions} */
  config;
  /** @type {HostManager} */
  hostManager;

  constructor(configPath) {
    this.configPath = configPath;
    this.config = JSON.parse(fs.readFileSync(this.configPath));
    this.hostManager = HostManager.fromJson(this.config);
    this.hostManager.listen();
  }
  /**
   * @param {string} name
   * @param {HostEndPointOptions} endPoint
   * @param {string} serviceName
   * @returns {Promise<void>}
   */
  async #addEndPoint(name, endPoint, serviceName) {
    let service = serviceName
      ? this.config.Services[serviceName]
      : this.config.Services["welcomeService"];
    if (!service) {
      throw new Error(
        "The service " +
          serviceName +
          "are not defined ! Define first or dont add serviceName to attach to welcomeService"
      );
    }
    this.hostManager.addHost(name, endPoint, service);
    this.config.EndPoints[name] = endPoint;
    await this.#saveConfig();
  }
  /**
   * @param {string} name
   * @param {HostEndPointOptions} endPoint
   * @param {string} serviceName
   * @returns {Promise<void>}
   */
  async #editEndPoint(name, endPoint, serviceName) {
    await this.#deleteEndPoint(name);
    await this.#addEndPoint("name", endPoint, serviceName);
  }
  async #saveConfig() {
    await fs.promises.writeFile(this.configPath, JSON.stringify(this.config));
  }
  async #deleteEndPoint(name) {
    let mustRemoveEndPoints = [];
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
    mustRemoveEndPoints.forEach((endPoint) => {
      this.hostManager.stopHost(name, endPoint);
    });
  }
  /**
   *
   * @param {string} serviceName
   * @param {HostServiceOptions} service
   */
  async #addService(serviceName, service) {
    if (this.config.Services[serviceName]) {
      throw new Error(
        "service with this name are avaliable; change name or if you want to edit use edit api"
      );
    }
    this.config.Services[serviceName] = service;
    await this.#saveConfig();
  }
  /**
   *
   * @param {string} serviceName
   * @param {HostServiceOptions} service
   */
  async #deleteServices(serviceName) {
    if (!this.config.Services[serviceName]) {
      throw new Error("service with this name are not found !");
    }
    delete this.config.Services[serviceName];
    for (let key in Object.keys(this.config.EndPoints)) {
      if (this.config.EndPoints[key].Routing == "serviceName") {
        const endPointConfig = this.config.EndPoints[key];
        await this.#editEndPoint(name, endPointConfig, "welcomeService");
      }
    }

    await this.#saveConfig();
  }
  /**
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async addEndPoint(req, res) {
    try {
      await this.#addEndPoint(
        req.body.name,
        req.body.endpoint,
        req.body.serviceName
      );
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("endPoint " + req.body.name + " added successfully");
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("error: " + error.message);
    }
  }

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async deleteEndPoint(req, res) {
    try {
      await this.#deleteEndPoint(req.body.name);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("endPoint " + req.body.name + " deleted successfuly");
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("error " + error.message);
    }
  }
  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async editEndPoint(req, res) {
    try {
      await this.#editEndPoint(
        req.body.name,
        req.body.endpoint,
        req.body.serviceName
      );
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("endPoint " + req.body.name + " edited successfuly");
    } catch (error) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("error " + error.message);
    }
  }
  async seeConfigs(req, res) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(this.config));
  }
  async deleteService(req, res) {
    await this.#deleteServices(req.body.serviceName, req.body.service);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("service " + req.body.name + " added successfuly");
  }
  async addService(req, res) {
    await this.#addService(req.body.serviceName, req.body.service);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("service " + req.body.name + " added successfuly");
  }
}

export default EndPointController;
