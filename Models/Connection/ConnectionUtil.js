import InvalidConfigException from "../Exceptions/InvalidConfigException.js";
import WebServerException from "../Exceptions/WebServerException.js";
import ConnectionInfo from "./ConnectionInfo.js";
import EdgeConnectionInfo from "./EdgeConnectionInfo.js";
import InlineConnectionInfo from "./InlineConnectionInfo.js";
import SqlConnectionInfo from "./SqlConnectionInfo.js";
import MongoConnectionInfo from "./MongoConnectionInfo.js";
import SqliteConnectionInfo from "./SqLiteConnectionInfo.js";
import MySqlConnectionInfo from "./MySqlConnectionInfo.js";
import SocketConnectionInfo from "./SocketConnectionInfo.js";
export default class ConnectionUtil {
  /**
   * @param {NodeJS.Dict<any>} settings
   * @returns {ConnectionInfo[]}
   */
  static loadConnections(settings) {
    /** @type {ConnectionInfo[]} */
    const retVal = [];
    for (const item in settings) {
      const key = item.toLowerCase();
      if (key.startsWith("connections.")) {
        const parts = key.split(".", 3);
        if (parts.length < 3) {
          throw new InvalidConfigException("HostSettings.Settings", key);
        }
        /** @type {ConnectionInfo} */
        let connection = null;
        switch (parts[1]) {
          case "sql": {
            connection = new SqlConnectionInfo(parts[2], settings[item]);
            break;
          }
          case "sqlite": {
            connection = new SqliteConnectionInfo(parts[2], settings[item]);
            break;
          }
          case "edge": {
            connection = new EdgeConnectionInfo(parts[2], settings[item]);
            break;
          }
          case "mysql": {
            connection = new MySqlConnectionInfo(parts[2], settings[item]);
            break;
          }
          case "inline": {
            connection = new InlineConnectionInfo(parts[2], settings[item]);
            break;
          }
          case "mongodb": {
            connection = new MongoConnectionInfo(parts[2], settings[item]);
            break;
          }
          case "socket": {
            connection = new SocketConnectionInfo(parts[2], settings[item]);
            break;
          }
          default: {
            if (parts[1] == "ws") {
              continue;
            } else {
              throw new WebServerException(
                `Provider type '${parts[1]}' not support in connection manager`
              );
            }
          }
        }
        retVal.push(connection);
      }
    }
    return retVal;
  }
}
