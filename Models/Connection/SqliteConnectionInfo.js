import sqlite3 from "sqlite3";
import ConnectionInfo from "./ConnectionInfo.js";
import SqliteSettingData from "./SqliteSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import CacheResult from "./../options/CacheResult.js";

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
      const retVal = new DataSourceCollection([
        Array.isArray(rows) ? rows : [rows],
      ]);

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

  /**
   *
   * @param {string} key
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<CacheResult|null>}
   */
  async loadContentAsync(key, cancellationToken) {
    /**@type {sqlite3.Database} */
    let database;
    try {
      database = new sqlite3.Database(this.settings.dbPath);
      const query = `SELECT * FROM ${this.settings.tableName}  WHERE key = ?`;
      const result = await  this.#executeSqliteQuery(database, query, [key]);
      return result[0]
    } finally {
      if (database) {
        database.close();
      }
    }
  }

  /**
   * @param {string} key
   * @param {string} content
   * @param {NodeJS.Dict<string>} properties
   * @returns {Promise<void>}
   */
  async addCacheContentAsync(key, content, properties) {
    let database = new sqlite3.Database(this.settings.dbPath);
    try {
      const savedContent = await this.loadContentAsync(key);
      if (savedContent) {
        await this.#executeSqliteQuery(
          database,
          `DELETE FROM ${this.settings.tableName} WHERE key = ?`,
          [key]
        );
      }
      const query = `INSERT INTO ${this.settings.tableName} (key, content, properties) VALUES (?, ?, ?)`;
      const result = this.#executeSqliteQuery(database, query, [
        key,
        content,
        JSON.stringify(properties),
      ]);
      return result;
      // } catch (err) {
      //   throw new Error("error in add cache  : " + err);
    } finally {
      if (database) {
        database.close();
      }
    }
  }
  /**
   * @param {sqlite3.Database} db
   * @param {string} query
   * @param {any[]} params
   * @returns {Promise<void>}
   */
  #executeSqliteQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /** @returns {Promise<void>} */
  async deleteAllCache() {
    return this.#executeSqliteQuery(`DELETE FROM ${this.settings.tableName}`);
  }
}
