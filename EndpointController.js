import HostManager from "./hostManager.js";
import fs from "fs";
import {
  HostEndPointOptions,
  HostManagerOptions,
  HostServiceOptions,
  ServiceSelectorPredicateItemOptions 
} from "./models/model.js";
import DefaultManagerConfig from "./Models/DefaultConfig.js";
import RouterHostService from "./services/routerHostService.js";

class EndPointController {
  /** @type {HostManagerOptions} */
  config;
  /** @type {HostManager} */
  hostManager;
  /** @type {DefaultManagerConfig}*/
  defaultConfig;
  /**
   *
   * @param {string} configPath
   * @param {HostServiceOptions} welcomeService
   * @param {DefaultManagerConfig} defaultConfig
   */
  constructor(configPath, welcomeService, defaultConfig) {
    this.configPath = configPath;
    this.config = JSON.parse(fs.readFileSync(this.configPath));
    this.config.Services.welcomeService = welcomeService;
    this.hostManager = HostManager.fromJson(this.config);
    this.defaultConfig = defaultConfig;
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
  async deleteService(req, res) {
    try {
      const serviceName = req.body.name;
      if (!this.config.Services[serviceName]) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            errorid: 1,
            message: "the service by this name not found",
          })
        );
      }
      let isHaveEndpoint = false;
      Object.keys(this.config.EndPoints).forEach((key) => {
        if (this.config.EndPoints[key].Routing == serviceName) {
          isHaveEndpoint = true;
        }
      });
      if (isHaveEndpoint) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ errorid: 1, message: "the service are in use" })
        );
      }
      delete this.config.Services[serviceName];
      await this.#saveConfig();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ errorid: 1, message: "service deleted successfuly" })
      );
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          errorid: 1,
          message: "internal server error",
        })
      );
    }
  }
  /**
   * @param {string} hostId
   */
  async #restartHost(hostId) {
    let host = this.#findHostById(hostId);
    this.#deleteHost(hostId);
    this.hostManager.addHost(
      hostname,
      host,
      this.config.Services[host.Routing]
    );
  }
  /**
   * @param {string} hostId
   */
  async #restartHostWithSpeceficService(serviceName) {
    Object.keys(this.config.EndPoints).forEach(async (key) => {
      if (this.config.EndPoints[key].Routing == serviceName) {
        const endpoint = JSON.stringify(this.config.EndPoints[key]);
        await this.#deleteHost(this.config.EndPoints[key].id);
        this.hostManager.addHost(
          key,
          JSON.parse(endpoint),
          this.config.Services[serviceName]
        );
      }
    });
    return Promise.resolve();
  }
  async addService(req, res) {
    if (
      !this.validateBody(
        {
          type: "string",
          name: "string",
          settings: "object",
        },
        req,
        res
      )
    ) {
      return;
    }
    try {
      let {
        name,
        type,
        defaultConfigUrl,
        permissionUrl,
        reportUrl,
        settings,
        readBodyTimeOut,
        processTimeout,
        maxBodySize,
        maxMultiPartSize,
      } = req.body;
      if (this.config.Services[name]) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "invalid service name",
            errorid: 1,
          })
        );
      }
      if (!type) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "type is required",
            errorid: 1,
          })
        );
      }
      /**@type {NodeJS.Dict<any>} */
      let formatedSetting = {
        ...settings,
        LibPath: this.defaultConfig.LibPath,
      };
      /** @type {HostServiceOptions} */
      let service = {
        Type: type,
        ReadBodyTimeOut: readBodyTimeOut,
        ProcessTimeOut: processTimeout,
        MaxBodySize: maxBodySize,
        MaxMultiPartSize: maxMultiPartSize,
        Streamer: {
          DefaultConfigUrl: defaultConfigUrl,
          PermissionUrl: permissionUrl,
          ReportUrl: reportUrl,
        },
        Settings: formatedSetting,
      };
      this.config.Services[name] = service;
      await this.#saveConfig();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "service " + req.body.name + "added successfuly",
          errorid: 1,
        })
      );
    } catch (error) {
      console.log(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "internal server error", errorid: 5 }));
    }
  }
  async editService(req, res) {
    if (
      !this.validateBody(
        {
          name: "string",
        },
        req,
        res
      )
    ) {
      return;
    }
    try {
      const data = this.config.Services[req.body.name];
      if (!data) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "the service not found", errorid: 3 })
        );
      }
      for (const key in req.body) {
        if (
          key != "name" &&
          key != "settings" &&
          req.body[key] !== null &&
          req.body[key] !== undefined
        ) {
          data[key] = req.body[key];
        }
      }
      const settings = req.body.settings;
      if (settings && typeof settings == "object") {
        Object.keys(settings).forEach((key) => {
          data.Settings[key] = settings[key];
        });
      }
      this.config.Services[req.body.name] = data;
      await this.#saveConfig();
      await this.#restartHostWithSpeceficService(req.body.name);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "service " + req.body.name + " edited successfuly",
          errorid: 1,
        })
      );
    } catch (error) {
      console.log(error);
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

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async addRouting(req, res) {
    if (
      !this.validateBody(
        {
          hostId: "string",
        },
        req,
        res
      )
    ) {
      return;
    }
    try {
      const { hostId, routing } = req.body;
      if (!Array.isArray(routing) || routing.length < 1) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            message: "routing must be array with minimum length of 1",
            errorid: 5,
          })
        );
      }
      let host = this.#findHostById(hostId);
      if (!host) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ errorid: 3, message: "host not found" })
        );
      }
      this.#deleteHost(hostId);
      host.Routing = {
        Async: true,
        Items: [...routing, { id: 0, Service: "welcomeService" }],
      };
      let hostname = this.#setHostById(hostId, host);
      await this.#saveConfig();
      let service = new RouterHostService(
        "name-router",
        host.Routing,
        this.hostManager.loadServices(this.config.Services)
      );
      this.hostManager.addHost(hostname, host, service);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ errorid: 1, message: "routing added successfuly" })
      );
    } catch (error) {
      console.log(error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "internal server error", errorid: 5 }));
    }
  }
  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns
   */
  async editRouting(req, res) {
    try {
      if (
        !this.validateBody(
          {
            hostId: "string",
          },
          req,
          res
        )
      ) {
        return;
      }
      const { hostId } = req.body;
      /** @type {ServiceSelectorPredicateItemOptions[]} */
      const routing = req.body.routing;
      if (!Array.isArray(routing) || routing.length < 1) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            message: "routing must be array with minimum length of 1",
            errorid: 5,
          })
        );
      }
      let host = this.#findHostById(hostId);
      if (!host) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ errorid: 3, message: "host not found" })
        );
      }
      if (!Array.isArray(host?.Routing.Items)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ errorid: 3, message: "use add routing" })
        );
      }

      routing.forEach((data) => {
        const index = host.Routing.Items.findIndex((item) => {
          item.id == data.id;
        });
        if (index != -1) {
          host.Routing.Items[index] == data;
        } else {
          throw new Error("at least one id is incorrect ");
        }
      });
      this.#deleteHost(hostId);
      let hostname = this.#setHostById(hostId, host);
      await this.#saveConfig();
      let service = new RouterHostService(
        "name-router",
        host.Routing,
        this.hostManager.loadServices(this.config.Services)
      );
      this.hostManager.addHost(hostname, host, service);
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ errorid: 1, message: "routing edited successfuly" })
      );
    } catch (error) {
      if (error.message == "at least one id is incorrect ") {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: error.message, errorid: 3 }));
      }
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "internal server error", errorid: 5 }));
    }
  }
}

export default EndPointController;
