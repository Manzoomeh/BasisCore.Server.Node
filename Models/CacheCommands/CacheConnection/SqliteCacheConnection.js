import SqliteCacheSetting from "./SqliteCacheSetting.js";
import CacheConnectionBase from "./CacheConnectionBase.js";
import CacheResult from "../../options/CacheResult.js";
import sqlite3 from "sqlite3";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import crypto from "crypto";
import { open, Database } from "sqlite"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import BasisCoreException from "../../Exceptions/BasisCoreException.js";
import { StorageTypeEnum } from "../../../enums/StorageTypeEnum.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export default class SqliteCacheConnection extends CacheConnectionBase {
  /** @type {SqliteCacheSetting} */
  settings;
  /** @type {Database} */
  fileDB
  /** @type {Database} */
  memoryDB
  /**
   * @param {SqliteCacheSetting} settings
   */
  constructor(settings) {
    super();
    this.settings = settings;
  }
  async initializeAsync() {
    const dbExists = existsSync(this.settings.dbPath + "cachedb.sql");
    const fileDB = await open({
      filename: this.settings.dbPath + "cachedb.sql",
      driver: sqlite3.Database,
    });
    if (!dbExists) {
      console.log(`Database at ${this.settings.dbPath} does not exist. Creating tables...`);
      await this.createTables(fileDB);
    }
    this.memoryDB = await this.#loadInMemoryDataBase(fileDB)
    console.log('Database backed up to in-memory database.');
    this.fileDB = fileDB;
    this.deleteExpiredCachesAsync()
  }
  async #loadInMemoryDataBase() {
    const memoryDB = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
    });
    await memoryDB.exec(`ATTACH DATABASE '${this.settings.dbPath + "cachedb.sql"}' AS fileDB`);
    const tables = await memoryDB.all("SELECT name FROM fileDB.sqlite_master WHERE type='table'");
    for (const table of tables) {
      const tableExists = await memoryDB.get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${table.name}'`
      );
      if (!tableExists && table.name != "sqlite_sequence") {
        await memoryDB.exec(`CREATE TABLE ${table.name} AS SELECT * FROM fileDB.${table.name}`);
        console.log(`Table ${table.name} copied to in-memory database.`);
      }
    }
    await memoryDB.exec('DETACH DATABASE fileDB');
    return memoryDB;
  }

  /**
   *
   * @param {string} key
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<CacheResult|null>}
   */
  async loadContentAsync(key, cancellationToken) {
    const query = `SELECT * FROM  cache_results  WHERE key = ?`;
    const result = await this.#executeSqliteQuery(this.memoryDB, query, [key]);
    if (result.length < 1) {
      return
    }
    let retVal;
    try {
      result[0].content =
        result[0]?.storage_type == StorageTypeEnum.FileBase
          ? await fs.readFile(
            path.join(__dirname, "../../../", result[0]?.content)
          )
          : result[0].content;
      retVal = result[0]
    } catch (error) {
      console.log("cache file was deleted for" + key);
    }
    return retVal;
  }

  /**
   * @param {string} key
   * @param {string} content
   * @param {NodeJS.Dict<string>} properties
   * @param {NodeJS.Dict<string>} cms 
   * @returns {Promise<void>}
   */
  async addCacheContentAsync(key, content, properties, cms) {
    try {
      let { isCachingAllowed,
        assetExpireAfterDays,
        expireDate,
        ownerId,
        dmnid,
        hostexpiredate } = cms
      await this.#addOrUpdateHost(dmnid, hostexpiredate, isCachingAllowed, ownerId, expireDate)
      await this.#executeSqliteQueryOnBothDBs(`DELETE FROM cache_results WHERE key = ?`,
        [key])
      const query = `INSERT INTO cache_results (key, content, properties , expire_at, dmnid  ,storage_type) VALUES (?, ?, ?,?,?,?)`;

      let filePath
      let filename
      if (this.settings.isFileBase) {

        filename =
          crypto.createHash("sha256").update(key).digest("hex") + ".bin";
        filePath = path.join(this.settings.filesPath, ownerId.toString(), dmnid.toString())
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(
          path.join(filePath, filename),
          content
        );
      }
      await this.#executeSqliteQueryOnBothDBs(query, [
        key,
        this.settings.isFileBase ? path.join(filePath, filename) : content,
        JSON.stringify(properties),
        assetExpireAfterDays,
        dmnid,
        this.settings.isFileBase ? 1 : 0
      ])
    } catch (err) {
      throw new Error("error in add cache  : " + err);
    }
  }
  #createDirectories(dirPath, ownerId, hostId) {
    dirPath = dirPath.trim();
    const ownerDir = path.join(dirPath, ownerId);
    const hostDir = path.join(ownerDir, hostId);

    try {
      if (!existsSync(ownerDir)) {
        mkdirSync(ownerDir, { recursive: true });
      }
      if (!existsSync(hostDir)) {
        mkdirSync(hostDir, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating directories:', error);
      throw new BasisCoreException("Error creating directories", error)
    }
  }
  /**
   * @param {Database} db
   * @param {string} query
   * @param {any[]} params
   * @returns {Promise<void|any[]>}
   */
  async #executeSqliteQuery(db, query, params = []) {
    try {
      return db.all(query, params);
    } catch (err) {
      console.error('Error running query:', query, err.message);
      throw new BasisCoreException("Error running query", err)
    }
  }
  async #executeSqliteQueryOnBothDBs(query, params) {
    return Promise.all([
      this.#executeSqliteQuery(this.fileDB, query, params),
      this.#executeSqliteQuery(this.memoryDB, query, params)
    ])
  }
  async deleteExpiredCachesAsync() {
    if (this.settings.isFileBase) {
      const selectQuery = `SELECT *
FROM cache_results cr
JOIN hosts_list hl ON cr.dmnid = hl.id
WHERE cr.storage_type = 1
  AND (
    (cr.expire_at IS NOT NULL AND DATE(cr.created_at, '+' || cr.expire_at || ' days') < DATE('now'))
    OR (cr.expire_at IS NULL AND DATE(cr.created_at, '+' || hl.expire_date || ' days') < DATE('now'))
  );

`;
      const result = await this.#executeSqliteQuery(this.memoryDB, selectQuery, [])
      const deleteFilePromises = result.map((element) => {
        try {
          fs.unlink(element.content)
        } catch (err) {
          console.log(`file not found or no access to tis file : ${element.content}`)
        }
      })
      await Promise.all(deleteFilePromises)
    }
    const query = `DELETE FROM cache_results
WHERE (
    (expire_at IS NOT NULL AND DATE(created_at, '+' || expire_at || ' days') < DATE('now'))
    OR (expire_at IS NULL AND dmnid IN (
        SELECT id FROM hosts_list
        WHERE DATE(created_at, '+' || expire_date || ' days') < DATE('now')
    ))
  );
`;
    await this.#executeSqliteQueryOnBothDBs(query, [])
  }

  /** @returns {Promise<void>} */
  async deleteAllCache() {
    return await this.#executeSqliteQueryOnBothDBs(`DELETE FROM cache_results`, [])
  }
  async extendOwnerhostsExpireDate(ownerId, newExpireDateString) {
    this.#executeSqliteQuery(db, `UPDATE hosts_list
        SET expire_date = ${newExpireDateString}
        WHERE owner_id = ${ownerId}
      `, [])
  }

  async createTables(db) {
    await this.#executeSqliteQuery(db, `
CREATE TABLE IF NOT EXISTS cache_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT,
    content TEXT,
    properties TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expire_at number,
    dmnid INTEGER,
    storage_type INTEGER,
    FOREIGN KEY (dmnid) REFERENCES hosts_list(id) ON DELETE CASCADE
);
 `
      , [])
    await this.#executeSqliteQuery(db, `
CREATE TABLE IF NOT EXISTS hosts_list (
    id INTEGER PRIMARY KEY UNIQUE,
    expire_date number,
    owner_expire_date DATETIME,
    is_caching_allowed INTEGER,
    owner_id INTEGER
 ); `, [])
  }
  /** @returns {Promise<void>} */
  async deleteExpiredCachehostsAsync() {
    let selectQuery = `SELECT 
            cr.*
            FROM 
            cache_results cr
            JOIN 
            hosts_list hl ON cr.dmnid = hl.id
            WHERE 
            cr.expire_at < CURRENT_TIMESTAMP
            AND cr.storage_type = 1;`
    let expiredFileBasedCaches = await this.#executeSqliteQuery(this.memoryDB, selectQuery, [])
    const deleteFilePromises = expiredFileBasedCaches.map((element) => {
      try {
        return fs.unlink(element.content)
      } catch (err) {
        console.log(`unexpected error to delete ${element.content}. file deleted or the webserver have no access to delete the cache.`)
      }
    })
    await promise.all(deleteFilePromises)
    await this.#executeSqliteQueryOnBothDBs(
      `DELETE 
      cr
      FROM 
      cache_results cr
      JOIN 
      hosts_list hl ON cr.dmnid = hl.id
      WHERE 
      cr.expire_at < CURRENT_TIMESTAMP;`, [])
    const query = `DELETE FROM hosts_list WHERE expire_date <= CURRENT_TIMESTAMP`;
    await this.#executeSqliteQueryOnBothDBs(query, [])
  }
  /**
   * 
   * @param {number} dmnId 
   * @param {string} hostexpiredate 
   * @param {boolean} isCachingAllowed 
   * @param {number} ownerId 
   * @returns {Promise<void>}
   */
  async #addOrUpdateHost(dmnId, hostexpiredate, isCachingAllowed, ownerId, ownerExpireDate, setting) {
    const existingHost = await this.#executeSqliteQuery(this.memoryDB,
      'SELECT * FROM hosts_list WHERE id = ?',
      [dmnId]
    );
    if (existingHost.length > 0) {
      await this.#executeSqliteQueryOnBothDBs(
        `UPDATE hosts_list SET 
                expire_date = ?, 
                is_caching_allowed = ?, 
                owner_id = ?, 
                owner_expire_date = ? 
            WHERE id = ?`,
        [hostexpiredate, isCachingAllowed, ownerId, ownerExpireDate, dmnId]
      );
    } else {
      // Insert a new record
      if (this.settings.isFileBase) {
        console.log(`create sub-directories`)
        this.#createDirectories(this.settings.filesPath, ownerId.toString(), dmnId.toString())
      }

      await this.#executeSqliteQueryOnBothDBs(
        `INSERT INTO hosts_list (id, expire_date, is_caching_allowed, owner_id, owner_expire_date) 
            VALUES (?, ?, ?, ?, ?)`,
        [dmnId, hostexpiredate, isCachingAllowed, ownerId, ownerExpireDate]
      );
    }
  }
  async changeHostCacheExpire(numberOfDays, dmnid) {
    const query = `
    UPDATE hosts_list
    SET expire_at = DATETIME(created_at, ?)
    WHERE id = ?;
    `;
    await this.#executeSqliteQueryOnBothDBs(query, [numberOfDays, dmnid])
  }
  async changeOwnerCacheExpire(numberOfDays, dmnid) {
    const query = `
    UPDATE hosts_list
    SET owner_expire_at = DATETIME(created_at, ?)
    WHERE id = ?;
    `;
    await this.#executeSqliteQueryOnBothDBs(query, [numberOfDays, dmnid])
  }
  /**
   * 
   * @param {number} numberOfDays 
   * @param {string} key 
   * @returns {Promise<void>}
   */
  async changeAssetCacheExpire(numberOfDays, key) {
    const query = `
    UPDATE cache_results
    SET expire_at = DATETIME(created_at, ?)
    WHERE key = ?;`;
    await this.#executeSqliteQueryOnBothDBs(query, [numberOfDays, key])
  }
}
