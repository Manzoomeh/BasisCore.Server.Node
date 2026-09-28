import InvalidConfigException from "../Exceptions/InvalidConfigException.js";
import ConnectionInfo from "./ConnectionInfo.js";
import EdgeConnectionInfo from "./EdgeConnectionInfo.js";
import InlineConnectionInfo from "./InlineConnectionInfo.js";
import SqlConnectionInfo from "./SqlConnectionInfo.js";
import MongoConnectionInfo from "./MongoConnectionInfo.js";
import SqliteConnectionInfo from "./SqliteConnectionInfo.js";
import MySqlConnectionInfo from "./MySqlConnectionInfo.js";
import SocketConnectionInfo from "./SocketConnectionInfo.js";

export default class ConnectionUtil {
  /**
   * @param {any} setting
   * @returns {NodeJS.Dict<any>|any}
   */
  static normalizeEndpointSetting(setting) {
    if (typeof setting === "string") {
      return { endpoint: setting.trim() };
    }
    if (!setting || typeof setting !== "object") {
      return setting;
    }
    return {
      ...setting,
      endpoint: setting.endpoint || setting.Endpoint,
    };
  }

  /**
   * @param {any} setting
   * @returns {NodeJS.Dict<any>|any}
   */
  static normalizeSqlSetting(setting) {
    if (typeof setting !== "string") {
      return setting;
    }
    const trimmed = setting.trim();
    const delimiterIndex = trimmed.lastIndexOf("|");
    if (delimiterIndex === -1) {
      return { connectionString: trimmed };
    }
    return {
      connectionString: trimmed.slice(0, delimiterIndex).trim(),
      procedure: trimmed.slice(delimiterIndex + 1).trim(),
    };
  }

  /**
   * @param {NodeJS.Dict<any>} settings
   * @returns {ConnectionInfo[]}
   */
  static loadConnections(settings) {
    /** @type {ConnectionInfo[]} */
    const retVal = [];
    if (!settings || typeof settings !== "object") {
      return retVal;
    }
    for (const item in settings) {
      const key = item.toLowerCase();
      if (key.startsWith("connections.")) {
        const parts = key.split(".", 3);
        if (parts.length < 3) {
          throw new InvalidConfigException("HostSettings.Settings", key);
        }
        /** @type {ConnectionInfo} */
        let connection = null;
        const providerType = parts[1];
        const connectionName = parts[2];
        const rawSetting = settings[item];
        try {
          switch (providerType) {
            case "sql": {
              connection = new SqlConnectionInfo(
                connectionName,
                this.normalizeSqlSetting(rawSetting)
              );
              break;
            }
            case "sqlite": {
              connection = new SqliteConnectionInfo(connectionName, rawSetting);
              break;
            }
            case "edge":
            case "edge-socket": {
              connection = new EdgeConnectionInfo(
                connectionName,
                this.normalizeEndpointSetting(rawSetting)
              );
              break;
            }
            case "mysql": {
              connection = new MySqlConnectionInfo(connectionName, rawSetting);
              break;
            }
            case "inline": {
              connection = new InlineConnectionInfo(connectionName, rawSetting);
              break;
            }
            case "mongodb":
            case "mongo": {
              connection = new MongoConnectionInfo(
                connectionName,
                this.normalizeEndpointSetting(rawSetting)
              );
              break;
            }
            case "socket": {
              connection = new SocketConnectionInfo(
                connectionName,
                this.normalizeEndpointSetting(rawSetting)
              );
              break;
            }
            case "ws":
            case "web": {
              continue;
            }
            default: {
              console.warn(
                `Provider type '${providerType}' is not supported; skipping connection '${connectionName}'`
              );
              continue;
            }
          }
        } catch (error) {
          console.error(
            `Failed to initialize connection '${connectionName}' (${providerType})`,
            error
          );
          continue;
        }
        if (connection) {
          retVal.push(connection);
        }
      }
    }
    return retVal;
  }
}
