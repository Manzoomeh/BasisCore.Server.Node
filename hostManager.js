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
} from "./models/model.js";
import {
  EdgeProxyHostService,
  HostService,
  SqlProxyHostService,
  StaticFileProxyHostService,
  HostEndPoint,
  RouterHostService,
} from "./services/hostServices.js";
import H2HttpHostEndPoint from "./endPoint/h2HttpHostEndPoint.js";

export default class HostManager {
  /**@type {HostEndPoint[]} */
  hosts;
  /**
/**
 * @param {HostManagerOptions} options
 */
  constructor(options) {
    this.hosts = [];
    this.loadEndpoints(options);
    process.on("uncaughtException", (error, origin) => {
      console.error("uncaught exception", { error, origin });
    });
  }

  listen() {
    for (const host of this.hosts) {
      try {
        host.listen();
      } catch (ex) {
        console.error(ex);
      }
    }
  }

  /**
   * @param {HostManagerOptions} options
   */
  loadEndpoints(options) {
    const services = this.loadServices(options.Services);
    for (const [name, endPointsOptions] of Object.entries(options.EndPoints)) {
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
              this.createHttpEndPoint(name, endPointsOptions, service);
              break;
            }
            default: {
              console.error(
                `${endPointsOptions.Type} not supported in this version of web server`
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

  /**
   * @param {string} name
   * @param {HostEndPointOptions} options
   * @param {HostService} service
   * @returns {HostEndPoint}
   */
  createHttpEndPoint(name, options, service) {
    for (const address of options.Addresses) {
      const [ip, port] = address.EndPoint.split(":", 2);
      const certificateOptions = this.getCertificateOptions(address.Certificate);
      const endPoint = address.Certificate && !address.Certificate.Http2
        ? new SecureHttpHostEndPoint(ip, port, service, certificateOptions)
        : new NonSecureHttpHostEndPoint(ip, port, service);
      this.hosts.push(endPoint);
    }
  }

  /**
   * @param {SslCertificateOptions | SniCertificateOptions} certificate
   * @returns {tls.SecureContextOptions}
   */
  getCertificateOptions(certificate) {
    const options = {};
    if (certificate) {
      if (certificate.Type === "ssl") {
        if (certificate.FilePath) {
          options.cert = fs.readFileSync(certificate.FilePath);
        }
        if (certificate.KeyPath) {
          options.key = fs.readFileSync(certificate.KeyPath);
        }
        if (certificate.PfxPath) {
          options.pfx = fs.readFileSync(certificate.PfxPath);
        }
        if (certificate.PfxPassword) {
          options.passphrase = certificate.PfxPassword;
        }
      } else if (certificate.Type === "sni") {
        const hostLookup = {};
        for (const host of certificate.Hosts) {
          const hostOptions = {};
          if (host.FilePath) {
            hostOptions.cert = fs.readFileSync(host.FilePath);
          }
          if (host.KeyPath) {
            hostOptions.key = fs.readFileSync(host.KeyPath);
          }
          if (host.PfxPath) {
            hostOptions.pfx = fs.readFileSync(host.PfxPath);
          }
          if (host.PfxPassword) {
            hostOptions.passphrase = host.PfxPassword;
          }
          for (const hostName of host.HostNames) {
            hostLookup[hostName.toLowerCase()] = hostOptions;
          }
        }
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
              `No certificate found for '${serverName}' in SNI settings`
            );
          }
        };
        options.SNICallback = sniCallback;
      }
    }
    return options;
  }

  /**
   * @param {NodeJS.Dict<HostServiceOptions>} services
   * @returns {HostService[]}
   */
  loadServices(services) {
    const retVal = [];
    for (const [name, serviceOptions] of Object.entries(services)) {
      try {
        switch (serviceOptions.Type.toLowerCase()) {
          case "sql": {
            retVal.push(this.createSqlDispatcher(name, serviceOptions));
            break;
          }
          case "file": {
            retVal.push(this.createFileDispatcher(name, serviceOptions));
            break;
          }
          default: {
            console.error(
              `${serviceOptions.Type} not supported in this version of web server`
            );
            break;
          }
        }
      } catch (ex) {
        console.error(ex);
      }
    }
    return retVal;
  }

  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   * @returns {HostService}
   */
  createSqlDispatcher(name, options) {
    const sqlConnection = options.Settings["Connections.sql.RoutingData"];
    if (sqlConnection) {
      return new SqlProxyHostService(name, sqlConnection, options);
    } else {
      const edgeConnection = options.Settings["Connections.edge-socket.RoutingData"];
      if (edgeConnection) {
        const [ip, port] = edgeConnection.split(":");
        return new EdgeProxyHostService(name, ip, port, options);
      }
    }
    throw new Error(`Can't detect dispatcher for service '${name}'!`);
  }

  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   * @returns {HostService}
   */
  createFileDispatcher(name, options) {
    const rootPath = options.Settings["Directory"];
    if (rootPath) {
      return new StaticFileProxyHostService(name, rootPath, options);
    } else {
      throw new Error(
        `The 'Directory' setting is not set for file dispatcher in '${name}' service!`
      );
    }
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