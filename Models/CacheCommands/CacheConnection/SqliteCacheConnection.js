import SqliteCacheSetting from "./SqliteCacheSetting.js";
import CacheConnectionBase from "./CacheConnectionBase.js";
import CacheResult from "../../options/CacheResult.js";
import sqlite3 from "sqlite3";

export default class SqliteCacheConnection extends CacheConnectionBase {
  /** @type {SqliteCacheSetting} */
  settings;

  /**
   * @param {SqliteCacheSetting} settings
   */
  constructor(settings) {
    super()
    this.settings = settings;
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
      const result = await this.#executeSqliteQuery(database, query, [key]);
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
