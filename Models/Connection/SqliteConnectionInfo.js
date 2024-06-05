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
      const result = await this.#executeSqliteQuery(
        database,
        `SELECT * FROM ${this.settings.tableName}  WHERE key = ?`,
        [key]
      );
      return result[0];
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
    const database = new sqlite3.Database(this.settings.dbPath);
    try {
      const query = `
      BEGIN TRANSACTION;
      WITH Selected AS (
        SELECT * FROM ${this.settings.tableName} WHERE key = ?
      )
      DELETE FROM ${this.settings.tableName} WHERE key = ? AND EXISTS (SELECT 1 FROM Selected);
      INSERT INTO ${this.settings.tableName} (key, content, properties) VALUES (?, ?, ?);
      COMMIT TRANSACTION;
    `;
      const result = this.#executeSqliteQuery(database, query, [
        key,
        content,
        JSON.stringify(properties),
      ]);
      return result;
    } catch (err) {
      throw new Error("error in add cache  : " + err);
    } finally {
      if (database) {
        database.close();
      }
    }
  }
  /**
   *
   * @param {sqlite3.Database} db
   * @param {string} query
   * @param {any[]} params
   * @returns {Promise<any[]>}
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
