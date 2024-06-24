import HostManager from "./hostManager.js";
import fs from "fs";
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

  constructor(configPath, welcomeService) {
    this.configPath = configPath;
    this.config = JSON.parse(fs.readFileSync(this.configPath));
    this.config.Services.welcomeService = welcomeService;
    this.hostManager = HostManager.fromJson(this.config);
  }
  listenAsync() {
    return this.hostManager.listenAsync();
  }
  /**
   *  @param {string} id
   *  @returns {HostEndPointOptions}
   */
  #findHostById(id) {
    let host;
    Object.keys(this.config.EndPoints).forEach((key) => {
      if (this.config.EndPoints[key].id == id) {
        host = this.config.EndPoints[key];
      }
    });
    return host ? JSON.parse(JSON.stringify(host)) : host;
  }
  /** @param {string} id */
  #setHostById(id, host, name) {
    let propKey;
    Object.keys(this.config.EndPoints).forEach((key) => {
      if (this.config.EndPoints[key].id == id) {
        propKey = key;
        this.config.EndPoints[key] = host;
      }
    });
    if (!propKey) {
      if (name) {
        this.config.EndPoints[name] = host;
      } else {
        throw new Error("host not found");
      }
    }
  }
  /**
   * @param {string} hostId
   * @param {string} endPointId
   * @param {string} endPoint
   * @param {string} serviceName
   * @returns {Promise<void>}
   */
  async #addHost(hostId, endPointId, endPoint, serviceName, type, name) {
    let host = this.#findHostById(hostId);
    let service = serviceName
      ? this.config.Services[serviceName]
      : host
      ? this.config.Services[host.Routing]
      : this.config.Services["welcomeService"];
    if (!service) {
      throw new Error(
        "The service " +
          serviceName +
          "are not defined ! Define first or dont add serviceName to attach to welcomeService"
      );
    }
    if (!host) {
      if (!type) {
        throw new Error(
          JSON.stringify({ errorid: 1, message: "enter type of host" })
        );
      }
      host = {
        Type: type,
        id: hostId,
        Addresses: [],
        Active: true,
        Routing: serviceName ?? "welcomeService",
      };
    } else {
      let existedEndPoint = host.Addresses.find((address) => {
        return address.id == endPointId || address.EndPoint == endPoint;
      });
      if (existedEndPoint) {
        throw new Error(
          JSON.stringify({
            errorid: "2",
            message: "invalid endpoint id or endpoint address",
          })
        );
      }
      this.#deleteHost(hostId);
    }
    host.Addresses.push({
      id: endPointId,
      EndPoint: endPoint,
    });
    let hostname = this.#setHostById(hostId, host, name);
    await this.#saveConfig();
    this.hostManager.addHost(hostname, host, service);
  }
  /**
   * @param {string} hostId
   * @param {HostEndPointOptions} endPointId
   * @returns {Promise<void>}
   */
  async #deleteAHostEndpoint(hostId, endPointId) {
    const host = this.#findHostById(hostId);
    if (!host) {
      throw new Error(
        JSON.stringify({
          errorid: 5,
          message: "host not found",
        })
      );
    }
    this.#deleteHost(hostId);
    const index = host.Addresses.findIndex(
      (address) => address.id === endPointId
    );
    delete host.Addresses.splice(index, 1);
    let hostname = this.#setHostById(hostId, host);
    await this.#saveConfig();
    this.hostManager.addHost(
      hostname,
      host,
      this.config.Services[host.Routing]
    );
  }
  /**
   * @param {string} name
   * @param {HostEndPointOptions} endPoint
   * @param {string} serviceName
   * @returns {Promise<void>}
   */
  async #editHost(hostId, endPointId, endPoint, serviceName) {
    const host = this.#findHostById(hostId);
    if (!host) {
      throw new Error(
        JSON.stringify({
          errorid: 5,
          message: "host not found",
        })
      );
    }
    let service = serviceName
      ? this.config.Services[serviceName]
      : this.config.Services[host.Routing];
    if (!service) {
      throw new Error(
        JSON.stringify({
          message:
            "The service " +
            serviceName +
            "are not defined ! Define first or dont add serviceName to attach to welcomeService",
          errorid: 5,
        })
      );
    }

    this.#deleteHost(hostId);
    const index = host.Addresses.findIndex(
      (address) => address.id === endPointId
    );
    host.Addresses[index] = {
      id: endPointId,
      EndPoint: endPoint,
    };
    let hostname = this.#setHostById(hostId, host);
    await this.#saveConfig();
    this.hostManager.addHost(hostname, host, service);
  }
  async #saveConfig() {
    await fs.promises.writeFile(this.configPath, JSON.stringify(this.config));
  }
  async #deleteHost(id) {
    let name;
    for (const [key, value] of Object.entries(this.config.EndPoints)) {
      if (value.id == id) {
        name = key;
      }
    }
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
      this.config.EndPoints[name].Addresses = [];
    } else {
      throw new Error("the endPoint not found");
    }
    await this.#saveConfig();
    this.hostManager.stopHost(name, mustRemoveEndPoints);
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
        await this.#editHost(name, endPointConfig, "welcomeService");
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
  async addHost(req, res) {
    if (
      !this.validateBody(
        { hostId: "string", endpointId: "string", endpoint: "string" },
        req,
        res
      )
    ) {
      return;
    }
    try {
      await this.#addHost(
        req.body.hostId,
        req.body.endpointId,
        req.body.endpoint,
        req.body.serviceName,
        req.body.type,
        req.body.name
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          errorid: 1,
          message: `Endpoint ${req.body.endpointId} added successfully`,
        })
      );
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(error.message);
    }
  }
  /**
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async editHost(req, res) {
    if (
      !this.validateBody(
        { hostId: "string", endpointId: "string", endpoint: "string" },
        req,
        res
      )
    ) {
      return;
    }
    try {
      await this.#editHost(
        req.body.hostId,
        req.body.endpointId,
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
  async deleteHost(req, res) {
    if (
      !this.validateBody({ hostId: "string", endpointId: "string" }, req, res)
    ) {
      return;
    }
    try {
      await this.#deleteAHostEndpoint(req.body.hostId, req.body.endpointId);
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("endPoint " + req.body.endpointId + " deleted successfully");
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
  async addCertificate(req, res) {
    if (
      !this.validateBody(
        {
          hostId: "string",
          endpointId: "string",
          pfxPath: "string",
          pfxPassword: "string",
          http2: "boolean",
          type: "string",
        },
        req,
        res
      )
    ) {
      return;
    }
    const { hostId, endpointId, pfxPath, pfxPassword, type, http2 } = req.body;
    if (type != "ssl") {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ errorid: 1, message: "invalid certificate type" })
      );
    }
    const host = this.#findHostById(hostId);
    this.#deleteHost(hostId);
    const index = host.Addresses.findIndex((address) => {
      return address.id === endpointId;
    });
    host.Addresses[index].Certificate = {
      Type: "ssl",
      PfxPath: pfxPath,
      PfxPassword: pfxPassword,
      Http2: http2,
    };
    let hostname = this.#setHostById(hostId, host);
    await this.#saveConfig();
    this.hostManager.addHost(
      hostname,
      host,
      this.config.Services[host.Routing]
    );
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ errorid: 1, message: "certificate added successfuly" })
    );
  }
  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async deleteCertificate(req, res) {
    const { hostId, endpointId } = req.body;
    const host = this.#findHostById(hostId);
    this.#deleteHost(hostId);
    const index = host.Addresses.findIndex((address) => {
      return address.id === endpointId;
    });
    delete host.Addresses[index].Certificate;
    let hostname = this.#setHostById(hostId, host);
    await this.#saveConfig();
    this.hostManager.addHost(
      hostname,
      host,
      this.config.Services[host.Routing]
    );
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ errorid: 1, message: "certificate deleted successfuly" })
    );
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
    try {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "service " + req.body.name + "added successfuly",
          errorid: 1,
        })
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "internal server error", errorid: 5 }));
    }
  }
  validateBody = (schema, req, res) => {
    const errors = [];

    for (const key in schema) {
      if (!req.body[key]) {
        errors.push(`Missing required field: ${key}`);
      } else if (typeof req.body[key] !== schema[key]) {
        errors.push(`Invalid type for field: ${key}. Expected ${schema[key]}`);
      }
    }
    if (errors.length) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ errors, errorid: 4 }));
      return false;
    }

    return true;
  };
}

export default EndPointController;
