import tls from "tls";
import fs from "fs";
import http from "http";
import url from "url";
import path from "path";

import {
  NonSecureHttpHostEndPoint,
  SecureHttpHostEndPoint,
} from "./endPoint/endPoints.js";
import {
  HostManagerOptions,
  HostEndPointOptions,
  HostServiceOptions,
  SslCertificateOptions,
  SniCertificateOptions,
} from "./Models/model.js";
import {
  HostService,
  StaticFileProxyHostService,
  HttpProxyHostService,
  HostEndPoint,
  RouterHostService,
} from "./Services/hostServices.js";
import H2HttpHostEndPoint from "./endPoint/h2HttpHostEndPoint.js";
import { HttpHostService } from "./Services/HttpHostService.js";
import EndPointController from "./EndpointController.js";
import { traceRequest, traceError } from "./modules/requestTrace.js";

const windowsAbsolutePathRegex = /^[A-Za-z]:[\\/]/;

function normalizePathSeparators(value) {
  return typeof value === "string" ? value.replace(/\\/g, "/") : value;
}

function resolvePathFromConfig(filePath, basePath = "") {
  const normalizedFilePath = normalizePathSeparators(filePath);
  if (!normalizedFilePath) {
    return normalizedFilePath;
  }
  if (
    path.isAbsolute(normalizedFilePath) ||
    windowsAbsolutePathRegex.test(normalizedFilePath)
  ) {
    return normalizedFilePath;
  }

  const envBasePath = process.env.CERT_BASE_PATH?.trim();
  const sourceBasePath = envBasePath || basePath;
  const normalizedBasePath = normalizePathSeparators(sourceBasePath);
  if (normalizedBasePath && !windowsAbsolutePathRegex.test(normalizedBasePath)) {
    return path.resolve(normalizedBasePath, normalizedFilePath);
  }
  return path.resolve(process.cwd(), normalizedFilePath);
}

export default class HostManager {
  /**@type {HostEndPoint[]} */
  hosts;
  #fileServiceClass;
  /**
   * @param {HostManagerOptions} options
   */
  constructor(options, { fileServiceClass = StaticFileProxyHostService } = {}) {
    this.#fileServiceClass = fileServiceClass;
    this.#loadEndpoints(options);
    process.on("uncaughtException", (error, origin) => {
      console.error("uncaught exception", { error, origin });
    });
    process.on("unhandledRejection", (reason) => {
      console.error("unhandled rejection", { reason });
    });
  }

  async listenAsync() {
    await Promise.all(this.hosts.map((host) => host.listenAsync()));
    return this;
  }

  /**
   * @param {HostManagerOptions} options
   */
  #loadEndpoints(options) {
    this.hosts = [];
    const services = this.loadServices(options.Services);
    traceRequest("bootstrap.endpoints.start", {
      endpointCount: Object.keys(options?.EndPoints || {}).length,
      serviceCount: services.length,
    });
    for (const name in options.EndPoints) {
      if (Object.hasOwnProperty.call(options.EndPoints, name)) {
        const endPointsOptions = options.EndPoints[name];
        if (endPointsOptions.Active) {
          let service = null;
          if (typeof endPointsOptions.Routing === "string") {
            service = services.find((x) => x.name == endPointsOptions.Routing);
          } else if (typeof endPointsOptions.Routing === "object") {
            service = new RouterHostService(
              "name-router",
              endPointsOptions.Routing,
              services
            );
          }
          if (service) {
            traceRequest("bootstrap.endpoint.active", {
              endpoint: name,
              type: (endPointsOptions.Type || "http").toLowerCase(),
              routingType: typeof endPointsOptions.Routing,
            });
            switch ((endPointsOptions.Type || "http").toLowerCase()) {
              case "http": {
                this.#createHttpEndPoint(name, endPointsOptions, service);
                break;
              }
              default: {
                console.error(
                  `${endPointsOptions.Type} not support in this version of web server`
                );
                break;
              }
            }
          } else {
            traceRequest(
              "bootstrap.endpoint.router_missing",
              { endpoint: name },
              "warn"
            );
            console.error(`Related router not found for ${name} endpoint`);
          }
        }
      }
    }
  }

  /**
   * @param {string} name
   * @param {HostEndPointOptions} options
   * @param {HostService} service
   * @param {boolean} toBeListen
   * @returns {HostEndPoint}
   */
  #createHttpEndPoint(name, options, service, toBeListen) {
    const cacheSettings = options.CacheSettings;
    options.Addresses.forEach((address) => {
      try {
        const [ip, port] = address.EndPoint.split(":", 2);
        traceRequest("bootstrap.endpoint.address", {
          endpoint: name,
          address: address.EndPoint,
          hasCertificate: !!address.Certificate,
          http2: !!address?.Certificate?.Http2,
          service: service?.name || "",
        });
        let retVal;
        if (address.Certificate) {
          /**@type {tls.SecureContextOptions}*/
          const tlsOptions = {};
          switch ((address.Certificate.Type || "ssl").toLowerCase()) {
            case "ssl": {
              /**@type {SslCertificateOptions & NodeJS.Dict<any>} */
              const sslOptions = address.Certificate;
              const certBasePath = sslOptions.AbsolutPath;
              if (sslOptions.FilePath) {
                const certPath = resolvePathFromConfig(
                  sslOptions.FilePath,
                  certBasePath
                );
                if (certPath.toLowerCase().endsWith(".pfx")) {
                  tlsOptions.pfx = fs.readFileSync(certPath);
                } else {
                  tlsOptions.cert = fs.readFileSync(certPath);
                }
              }
              if (sslOptions.KeyPath) {
                tlsOptions.key = fs.readFileSync(
                  resolvePathFromConfig(sslOptions.KeyPath, certBasePath)
                );
              }
              if (sslOptions.PfxPath) {
                tlsOptions.pfx = fs.readFileSync(
                  resolvePathFromConfig(sslOptions.PfxPath, certBasePath)
                );
              }
              if (sslOptions.PfxPassword || sslOptions.Password) {
                tlsOptions.passphrase =
                  sslOptions.PfxPassword || sslOptions.Password;
              }
              break;
            }
            case "sni": {
              /**@type {SniCertificateOptions & NodeJS.Dict<any>} */
              const sniOptions = address.Certificate;
              /**@type {NodeJS.Dict<tls.SecureContextOptions>} */
              const hostLookup = {};
              /** @type {{suffix: string, options: tls.SecureContextOptions}[]} */
              const wildcardHostLookup = [];
              /** @type {tls.SecureContextOptions | null} */
              let defaultSecureOptions = null;
              const certBasePath = sniOptions.AbsolutPath;
              (Array.isArray(sniOptions.Hosts) ? sniOptions.Hosts : []).forEach(
                (host) => {
                /**@type {tls.SecureContextOptions}*/
                  const hostSecureOptions = {};
                if (host.FilePath) {
                    const certPath = resolvePathFromConfig(
                    host.FilePath,
                    certBasePath
                  );
                    if (certPath.toLowerCase().endsWith(".pfx")) {
                      hostSecureOptions.pfx = fs.readFileSync(certPath);
                  } else {
                      hostSecureOptions.cert = fs.readFileSync(certPath);
                  }
                }
                if (host.KeyPath) {
                    hostSecureOptions.key = fs.readFileSync(
                    resolvePathFromConfig(host.KeyPath, certBasePath)
                  );
                }
                if (host.PfxPath) {
                    hostSecureOptions.pfx = fs.readFileSync(
                    resolvePathFromConfig(host.PfxPath, certBasePath)
                  );
                }
                if (host.PfxPassword || host.Password) {
                    hostSecureOptions.passphrase =
                      host.PfxPassword || host.Password;
                }
                  if (
                    (hostSecureOptions.cert || hostSecureOptions.pfx) &&
                    !defaultSecureOptions
                  ) {
                    defaultSecureOptions = hostSecureOptions;
                }
                const hostNames = host.HostNames || host.hostNames || [];
                hostNames.forEach((hostNameRaw) => {
                    const hostName = String(hostNameRaw || "")
                    .toLowerCase()
                    .trim()
                    .replace(/\.$/, "");
                  if (!hostName) {
                    return;
                  }
                  if (hostName.startsWith("*.")) {
                      wildcardHostLookup.push({
                      suffix: hostName.slice(1),
                        options: hostSecureOptions,
                    });
                    return;
                  }
                    hostLookup[hostName] = hostSecureOptions;
                });
                }
              );
              tlsOptions.SNICallback = (serverName, callback) => {
                const normalizedServerName = String(serverName || "")
                  .toLowerCase()
                  .trim()
                  .replace(/\.$/, "");
                let selected = hostLookup[normalizedServerName];
                if (!selected) {
                  const wildcard = wildcardHostLookup.find((item) => {
                    return (
                      normalizedServerName.endsWith(item.suffix) &&
                      normalizedServerName.length > item.suffix.length
                    );
                  });
                  if (wildcard) {
                    selected = wildcard.options;
                }
                }
                if (!selected) {
                  selected = defaultSecureOptions;
                }
                if (!selected) {
                  callback(
                    new Error(
                      `In sni setting no certificate found for '${normalizedServerName}'`
                    )
                  );
                  return;
                }
                try {
                  callback(null, tls.createSecureContext(selected));
                } catch (error) {
                  callback(error);
                }
              };
              if (defaultSecureOptions) {
                if (defaultSecureOptions.cert) {
                  tlsOptions.cert = defaultSecureOptions.cert;
                  tlsOptions.key = defaultSecureOptions.key;
                } else if (defaultSecureOptions.pfx) {
                  tlsOptions.pfx = defaultSecureOptions.pfx;
                  if (defaultSecureOptions.passphrase) {
                    tlsOptions.passphrase = defaultSecureOptions.passphrase;
                  }
                }
              }
              break;
            }
            default: {
              throw new Error(
                `Unsupported certificate type '${address.Certificate.Type}'`
              );
            }
          }
          if (!address.Certificate.Http2) {
            retVal = new SecureHttpHostEndPoint(
              ip,
              port,
              service,
              tlsOptions,
              cacheSettings
            );
          } else {
            retVal = new H2HttpHostEndPoint(
              ip,
              port,
              service,
              tlsOptions,
              cacheSettings
            );
          }
        } else {
          retVal = new NonSecureHttpHostEndPoint(
            ip,
            port,
            service,
            cacheSettings
          );
        }
        if (toBeListen) {
          retVal.listenAsync().then(() => {
            this.hosts.push(retVal);
          });
        } else {
          this.hosts.push(retVal);
        }
      } catch (error) {
        traceError("bootstrap.endpoint.configure_error", error, {
          endpoint: name,
          address: address?.EndPoint || "",
        });
        console.error(
          `Failed to configure endpoint '${name}' on '${address.EndPoint}'`,
          error
        );
      }
    });
  }
  /**
   * @param {NodeJS.Dict<HostServiceOptions>} services
   * @returns {HostService[]}
   */
  loadServices(services) {
    /**@type {HostService[]} */
    const retVal = new Array();
    for (const name in services) {
      if (Object.hasOwnProperty.call(services, name)) {
        const serviceOptions = services[name];
        try {
          traceRequest("bootstrap.service.load", {
            service: name,
            type: String(serviceOptions?.Type || "").toLowerCase(),
          });
          switch (serviceOptions.Type.toLowerCase()) {
            case "http":
            case "sql": {
              retVal.push(new HttpHostService(name, serviceOptions));
              break;
            }
            case "file": {
              retVal.push(this.#createFileDispatcher(name, serviceOptions));
              break;
            }
            case "proxy": {
              retVal.push(new HttpProxyHostService(name, serviceOptions));
              break;
            }
            default: {
              throw new Error(
                `${serviceOptions.Type} not support in this version of web server`
              );
            }
          }
        } catch (ex) {
          traceError("bootstrap.service.load_error", ex, { service: name });
          console.error(ex);
        }
      }
    }
    return retVal;
  }

  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   * @returns {HostService}
   */
  #createFileDispatcher(name, options) {
    /**@type {HostService} */
    let service = null;
    const rootPath = options.Settings["Directory"];
    if (rootPath) {
      service = new this.#fileServiceClass(name, rootPath, options);
    } else {
      throw new Error(
        `The 'Directory' setting not set for file dispatcher in '${name}' service!`
      );
    }
    return service;
  }
  /**
   * @param {string} name
   * @param {HostEndPointOptions} options
   * @param {HostService} service
   * @returns {HostEndPoint}
   */
  addHost(name, options, service) {
    let serviceClass;
    try {
      switch (service.Type.toLowerCase()) {
        case "http": {
          serviceClass = new HttpHostService(name, service);
          break;
        }
        case "sql": {
          serviceClass = new HttpHostService(name, service);
          break;
        }
        case "file": {
          serviceClass = this.#createFileDispatcher(name, service);
          break;
        }
        case "proxy": {
          serviceClass = new HttpProxyHostService(name, service);
          break;
        }
        default: {
          console.error(
            `${service.Type} not support in this version of web server`
          );
          break;
        }
      }
    } catch (ex) {
      console.error(ex);
    }
    this.#createHttpEndPoint(name, options, serviceClass, true);
  }
  stopHost(name, endPoints) {
    this.hosts.forEach((host) => {
      endPoints.forEach((endPoint) => {
        if (host._ip === endPoint._ip && host._port === endPoint._port) {
          this.hosts.pop(host);
          host?.kill();
        }
      });
    });
  }
  static async startManagementServer(
    configPath,
    welcomeService,
    address,
    port,
    defaultConfig
  ) {
    const endPointController = new EndPointController(
      configPath,
      welcomeService,
      defaultConfig
    );
    await endPointController.listenAsync();
    const server = http.createServer(async (req, res) => {
      let body = "";
      const urlObj = url.parse(req.url);
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        req.body = body.length > 0 ? JSON.parse(body) : undefined;
        req.query = urlObj.query;
        const { url, method } = req;
        if (url == "/endpointmanager/host" && method === "POST") {
          return endPointController.addHost(req, res);
        }
        if (url == "/endpointmanager/host" && method === "PATCH") {
          return endPointController.editHost(req, res);
        }
        if (url == "/endpointmanager/host" && method === "DELETE") {
          return endPointController.deleteHost(req, res);
        }
        if (url == "/endpointmanager/service" && method === "POST") {
          return endPointController.addService(req, res);
        }
        if (url == "/endpointmanager/service" && method === "PATCH") {
          return endPointController.editService(req, res);
        }
        if (url == "/endpointmanager/service" && method === "DELETE") {
          return endPointController.deleteService(req, res);
        }
        if (url == "/endpointmanager/certificate" && method === "POST") {
          return endPointController.addCertificate(req, res);
        }
        if (url == "/endpointmanager/certificate" && method === "DELETE") {
          return endPointController.deleteCertificate(req, res);
        }
        if (url == "/endpointmanager/routing" && method === "POST") {
          return endPointController.addRouting(req, res);
        }
        if (url == "/endpointmanager/routing" && method === "PUT") {
          return endPointController.deleteCertificate(req, res);
        }
        res.writeHead(404, { "Content-Type": "text/html" });
        return res.end(await fs.promises.readFile("./index.html"));
      });
    });
    server.listen(port, address, () => {
      console.log(`management Server running at ${address}:${port}`);
    });
  }
  /**
   * @param {object} jsonObj
   * @returns {HostManager}
   */
  static fromJson(jsonObj, options = {}) {
    const hostOptions = new HostManagerOptions();
    return new HostManager(Object.assign(hostOptions, jsonObj), options);
  }
}
