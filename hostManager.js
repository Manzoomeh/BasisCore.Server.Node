import tls from "tls";
import fs from "fs";
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
  EdgeProxyHostService,
  HostService,
  SqlProxyHostService,
  StaticFileProxyHostService,
  HostEndPoint,
  RouterHostService,
} from "./Services/hostServices.js";
import H2HttpHostEndPoint from "./endPoint/h2HttpHostEndPoint.js";

export default class HostManager {
  /**@type {HostEndPoint[]} */
  hosts;
  /**
   * @param {HostManagerOptions} options
   */
  constructor(options) {
    this.#loadEndpoints(options);
    process.on("uncaughtException", (error, origin) => {
      console.error("uncaught exception", { error, origin });
    });
  }

  listen() {
    this.hosts.forEach((host) => {
      try {
        host.listen();
      } catch (ex) {
        console.error(ex);
      }
    });
  }

  /**
   * @param {HostManagerOptions} options
   */
  #loadEndpoints(options) {
    this.hosts = [];
    const services = this.#loadServices(options.Services);
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
   * @returns {HostEndPoint}
   */
  #createHttpEndPoint(name, options, service) {
    options.Addresses.forEach((address) => {
      const [ip, port] = address.EndPoint.split(":", 2);
      if (address.Certificate) {
        /**@type {tls.SecureContextOptions}*/
        const options = {};
        switch (address.Certificate.Type) {
          case "ssl": {
            /**@type {SslCertificateOptions} */
            const sslOptions = address.Certificate;
            if (sslOptions.FilePath) {
              options.cert = fs.readFileSync(sslOptions.FilePath);
            }
            if (sslOptions.KeyPath) {
              options.key = fs.readFileSync(sslOptions.KeyPath);
            }
            if (sslOptions.PfxPath) {
              options.pfx = fs.readFileSync(sslOptions.PfxPath);
            }
            if (sslOptions.PfxPassword) {
              options.passphrase = sslOptions.PfxPassword;
            }
            break;
          }
          case "sni": {
            /**@type {SniCertificateOptions} */
            const sniOptions = address.Certificate;
            /**@type {NodeJS.Dict<tls.SecureContextOptions>} */
            const hostLookup = {};
            sniOptions.Hosts.forEach((host) => {
              /**@type {tls.SecureContextOptions}*/
              const options = {};
              if (sslOptions.FilePath) {
                options.cert = fs.readFileSync(host.FilePath);
              }
              if (sslOptions.KeyPath) {
                options.key = fs.readFileSync(host.KeyPath);
              }
              if (sslOptions.PfxPath) {
                options.pfx = fs.readFileSync(host.PfxPath);
              }
              if (sslOptions.PfxPassword) {
                options.passphrase = fs.readFileSync(host.PfxPassword);
              }
              host.HostNames.forEach((hostName) => {
                hostLookup[hostName.toLowerCase()] = options;
              });
            });
            const sniCallback = (serverName, callback) => {
              const set = hostLookup[serverName.toLowerCase()];
              if (set) {
                callback(
                  null,
                  new tls.createSecureContext({
                    cert: set.cert,
                    key: set.key,
                  })
                );
              } else {
                console.log(
                  `In sni setting no certificate found fot '${serverName}'`
                );
              }
            };
            options.SNICallback = sniCallback;
            break;
          }
        }
        if (!address.Certificate.Http2) {
          this.hosts.push(
            new SecureHttpHostEndPoint(ip, port, service, options)
          );
        } else {
          this.hosts.push(new H2HttpHostEndPoint(ip, port, service, options));
        }
      } else {
        this.hosts.push(new NonSecureHttpHostEndPoint(ip, port, service));
      }
    });
  }

  /**
   * @param {NodeJS.Dict<HostServiceOptions>} services
   * @returns {HostService[]}
   */
  #loadServices(services) {
    /**@type {HostService[]} */
    const retVal = new Array();
    for (const name in services) {
      if (Object.hasOwnProperty.call(services, name)) {
        const serviceOptions = services[name];
        try {
          switch (serviceOptions.Type.toLowerCase()) {
            case "sql": {
              retVal.push(this.#createSqlDispatcher(name, serviceOptions));
              break;
            }
            case "file": {
              retVal.push(this.#createFileDispatcher(name, serviceOptions));
              break;
            }
            default: {
              console.error(
                `${serviceOptions.Type} not support in this version of web server`
              );
              break;
            }
          }
        } catch (ex) {
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
  #createSqlDispatcher(name, options) {
    /**@type {HostService} */
    let service = null;
    const sqlConnection = options.Settings["Connections.sql.RoutingData"];
    if (sqlConnection) {
      service = new SqlProxyHostService(name, sqlConnection, options);
    } else {
      const edgeConnection =
        options.Settings["Connections.edge-socket.RoutingData"];
      if (edgeConnection) {
        const [ip, port] = edgeConnection.split(":");
        service = new EdgeProxyHostService(name, ip, port, options);
      }
    }
    if (!service) {
      throw new Error(`can't detect dispatcher for service '${name}'!`);
    }
    return service;
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
      service = new StaticFileProxyHostService(name, rootPath, options);
    } else {
      throw new error(
        `The 'Directory' setting not set for file dispatcher in '${name}' service!`
      );
    }
    return service;
  }
  /**
   * @param {object} jsonObj
   * @returns {HostManager}
   */
  static fromJson(jsonObj) {
    const options = new HostManagerOptions();
    return new HostManager(Object.assign(options, jsonObj));
  }
}
