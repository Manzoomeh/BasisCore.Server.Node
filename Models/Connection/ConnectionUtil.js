import InvalidConfigException from "../Exceptions/InvalidConfigException.js";
import ConnectionInfo from "./ConnectionInfo.js";
import SqlConnectionInfo from "./SqlConnectionInfo.js";

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
          default: {
            throw new InvalidConfigException("HostSettings.Settings", key);
          }
        }
        retVal.push(connection);
      }
    }
    return retVal;
  }
}
