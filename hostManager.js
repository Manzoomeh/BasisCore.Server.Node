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
} from "./models/model.js";
import {
  EdgeProxyHostService,
  HostService,
  SqlProxyHostService,
  StaticFileProxyHostService,
  RequestDispatcher,
  HostEndPoint,
} from "./services/hostServices.js";
import H2HttpHostEndPoint from "./endPoint/h2HttpHostEndPoint.js";

export default class HostManager {
  /**@type {HostEndPoint[]} */
  hosts;
  /**
   * @param {HostManagerOptions} options
   */
  constructor(options) {
    var dispatchers = this.#loadDispatchers(options.Services);
    this.hosts = [];
    this.#loadEndpoints(options.EndPoints, dispatchers);
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
   * @param {NodeJS.Dict<HostEndPointOptions>} endPoints
   * @param {HostService[]} dispatchers
   * @return {HostEndPoint[]}
   */
  #loadEndpoints(endPoints, dispatchers) {
    for (const name in endPoints) {
      if (Object.hasOwnProperty.call(endPoints, name)) {
        const endPointsOptions = endPoints[name];
        if (endPointsOptions.Active) {
          var dispatcher = null;
          if (typeof endPointsOptions.Routing === "string") {
            dispatcher = dispatchers.find(
              (x) => x.name == endPointsOptions.Routing
            );
          }
          console.log(dispatcher);
          if (dispatcher) {
            switch ((endPointsOptions.Type || "http").toLowerCase()) {
              case "http": {
                this.#createHttpEndPoint(name, endPointsOptions, dispatcher);
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
   * @param {RequestDispatcher} dispatcher
   * @returns {HostEndPoint}
   */
  #createHttpEndPoint(name, options, dispatcher) {
    //console.table(options);
    options.Addresses.forEach((address) => {
      const [ip, port] = address.EndPoint.split(":", 2);
      console.log(name, ip, port, typeof dispatcher);
      if (address.Certificate) {
        /**@type {tls.SecureContextOptions}*/
        var options = {};
        if (address.Certificate.Type === "ssl") {
          /**@type {SslCertificateOptions} */
          var sslOptions = address.Certificate;
          options.cert = fs.readFileSync(sslOptions.FilePath);
          options.key = fs.readFileSync(sslOptions.KeyPath);
        }
        if (!address.Certificate.Http2) {
          this.hosts.push(
            new SecureHttpHostEndPoint(ip, port, dispatcher, options)
          );
        } else {
          this.hosts.push(
            new H2HttpHostEndPoint(ip, port, dispatcher, options)
          );
        }
      } else {
        this.hosts.push(new NonSecureHttpHostEndPoint(ip, port, dispatcher));
      }
    });
  }

  /**
   * @param {NodeJS.Dict<HostServiceOptions>} services
   * @returns {HostService[]}
   */
  #loadDispatchers(services) {
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
    var service = null;
    const sqlConnection = options.Settings["Connections.sql.RoutingData"];
    if (sqlConnection) {
      service = new SqlProxyHostService(name, sqlConnection);
    } else {
      const edgeConnection =
        options.Settings["Connections.edge-socket.RoutingData"];
      if (edgeConnection) {
        const [ip, port] = edgeConnection.split(":");
        service = new EdgeProxyHostService(name, ip, port);
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
    var service = null;
    const rootPath = options.Settings["Directory"];
    if (rootPath) {
      service = new StaticFileProxyHostService(name, rootPath);
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
    var options = new HostManagerOptions();
    return new HostManager(Object.assign(options, jsonObj));
  }
}
