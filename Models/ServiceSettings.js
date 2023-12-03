import ConnectionInfo from "./Connection/ConnectionInfo.js";
import ConnectionUtil from "./Connection/ConnectionUtil.js";
import BasisConnectionSourceNotFoundException from "./Exceptions/BasisConnectionSourceNotFoundException.js";
import InvalidConfigException from "./Exceptions/InvalidConfigException.js";
import { HostServiceOptions } from "./model.js";

export default class ServiceSettings {
  /** @type {HostServiceOptions} */
  _options;
  /** @type {NodeJS.Dict<ConnectionInfo>} */
  _connections;
  /** @type {ConnectionInfo} */
  routerConnection;
  /** @type {ConnectionInfo} */
  callConnection;
  /** @type {ConnectionInfo} */
  ilUpdateConnection;
  /**
   * @param {HostServiceOptions} options
   */
  constructor(options) {
    this._options = options;
    this._connections = {};
    ConnectionUtil.loadConnections(options.Settings).forEach(
      (connection) =>
        (this._connections[connection.name] = connection)
    );
    if ("routingdata" in this._connections) {
      this.routerConnection = this._connections.routingdata;
    }
    if ("callcommand" in this._connections) {
      this.callConnection = this._connections.callcommand;
    }
    if ("ilupdate" in this._connections) {
      this.ilUpdateConnection = this._connections.ilupdate;
    }
  }

  /**
   * @param {string} connectionName
   * @returns {IConnectionInfo}
   */
  getConnection(connectionName) {
    if (connectionName.toLowerCase() in this._connections) {
      return this._connections[connectionName.toLowerCase()];
    }
    throw new BasisConnectionSourceNotFoundException(connectionName);
  }

  /**
   * @param {string} key
   * @param {string?} defaultValue
   * @returns {string}
   */
  getDefault(key, defaultValue = null) {
    const defaultKey = `default.${key}`;
    console.log("sdsd");
    const value = this._options?.Settings
      ? this._options.Settings[defaultKey]
      : defaultValue;
    if (!value) {
      throw new InvalidConfigException("host configuration file", defaultKey);
    }
  }
}
