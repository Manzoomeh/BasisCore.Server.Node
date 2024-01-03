import sqlite3 from "sqlite3";
import ConnectionInfo from "./ConnectionInfo.js";
import SqliteSettingData from "./SqliteSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
export default class SqliteConnectionInfo extends ConnectionInfo {
  /** @type {SqliteSettingData} */
  settings;

  /**
   * @param {string} name
   * @param {SqliteSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    this.settings = settings;
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    let database;
    try {
      database = new sqlite3.Database(this.settings.dbPath);

      const rows = await new Promise((resolve, reject) => {
        database.all(this.settings.query, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
      const retVal = new DataSourceCollection(
       [ Array.isArray(rows) ? rows : [rows]]
      );

      return retVal;
    } finally {
      if (database) {
        database.close();
      }
    }
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IDataSource>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    throw new Error("get routing data are not supported");
  }
  async testConnectionAsync() {
    throw new Error("test connection is not supported in sqlite");
  }
}
