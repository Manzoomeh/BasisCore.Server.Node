import SqliteCacheSetting from "./SqliteCacheSetting.js";
import CacheConnectionBase from "./CacheConnectionBase.js";
import CacheResult from "../../options/CacheResult.js";
import sqlite3 from "sqlite3";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export default class SqliteCacheConnection extends CacheConnectionBase {
  /** @type {SqliteCacheSetting} */
  settings;

  /**
   * @param {SqliteCacheSetting} settings
   */
  constructor(settings) {
    super();
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
      let retVal;
      try {
        retVal =
          result[0]?.content && this.settings.isFileBase
            ? await fs.readFile(
                path.join(this.settings.filesPath, result[0]?.content)
              )
            : result[0];
      } catch (error) {
        console.log("cache file was deleted for" + key);
      }
      return retVal;
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
      const selectQuery = `SELECT * FROM ${this.settings.tableName}  WHERE key = ?`;
      const [savedContent] = await this.#executeSqliteQuery(
        database,
        selectQuery,
        [key]
      );
      if (savedContent) {
        await this.#executeSqliteQuery(
          database,
          `DELETE FROM ${this.settings.tableName} WHERE key = ?`,
          [key]
        );
        try {
          this.settings.isFileBase
            ? fs.unlink(
                path.join(this.settings.filesPath, savedContent?.content)
              )
            : undefined;
        } catch (err) {
        }
      }
      const query = `INSERT INTO ${this.settings.tableName} (key, content, properties) VALUES (?, ?, ?)`;
      let filename;
      if (this.settings.isFileBase) {
        filename =
          crypto.createHash("sha256").update(key).digest("hex") + ".bin";
        await fs.writeFile(
          path.join(this.settings.filesPath, filename),
          content
        );
      }
      const result = this.#executeSqliteQuery(database, query, [
        key,
        filename ? filename : content,
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
