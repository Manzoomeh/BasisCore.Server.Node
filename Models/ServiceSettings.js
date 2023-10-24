import ConnectionInfo from "./Connection/ConnectionInfo.js";
import ConnectionUtil from "./Connection/ConnectionUtil.js";
import BasisConnectionSourceNotFoundException from "./Exceptions/BasisConnectionSourceNotFoundException.js";
import { HostServiceOptions } from "./model.js";

export default class ServiceSettings {
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
    this._connections = {};
    ConnectionUtil.loadConnections(options.Settings).forEach(
      (connection) => (this._connections[connection.name] = connection)
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
    if (connectionName in this._connections) {
      return this._connections[connectionName];
    }
    throw new BasisConnectionSourceNotFoundException(connectionName);
  }
}
