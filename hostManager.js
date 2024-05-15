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
  HostService,
  StaticFileProxyHostService,
  HostEndPoint,
  RouterHostService,
} from "./services/hostServices.js";
import H2HttpHostEndPoint from "./endPoint/h2HttpHostEndPoint.js";
import { HttpHostService } from "./services/HttpHostService.js";

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
   * @param {boolean} toBeListen
   * @returns {HostEndPoint}
   */
  #createHttpEndPoint(name, options, service, toBeListen) {
    options.Addresses.forEach((address) => {
      const [ip, port] = address.EndPoint.split(":", 2);
      let retVal;
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
          retVal = new SecureHttpHostEndPoint(ip, port, service, options);
        } else {
          retVal = new H2HttpHostEndPoint(ip, port, service, options);
        }
      } else {
        retVal = new NonSecureHttpHostEndPoint(ip, port, service);
      }
      if (toBeListen) {
        console.log("RRRRRRRRRRRRRRRRRRRRRRRRRRR", toBeListen, retVal);
        retVal.listen();
      }
      this.hosts.push(retVal);
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
            case "http": {
              retVal.push(new HttpHostService(name, serviceOptions));
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
        case "file": {
          serviceClass = this.#createFileDispatcher(name, service);
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
          host.kill()
        }
      });
    });

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
