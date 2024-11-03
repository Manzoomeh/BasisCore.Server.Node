import SqliteCacheSetting from "./SqliteCacheSetting.js";
import CacheConnectionBase from "./CacheConnectionBase.js";
import CacheResult from "../../options/CacheResult.js";
import sqlite3 from "sqlite3";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import crypto from "crypto";
import { open, Database } from "sqlite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import BasisCoreException from "../../Exceptions/BasisCoreException.js";
import { StorageTypeEnum } from "../../../enums/StorageTypeEnum.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
sqlite3.verbose();

class UserAgentRow {
  /** @type {number} */
  id;
  /** @type  {string} */
  user_agent;
  /**@type {number} */
  device_id;
}
class IChanges {
  /** @type {Array<UserAgentRow>} */
  added;
  /** @type {Array<UserAgentRow>} */
  edited;
}

export default class SqliteCacheConnection extends CacheConnectionBase {
  /** @type {SqliteCacheSetting} */
  settings;
  /** @type {Database} */
  fileDB;
  /** @type {Database} */
  memoryDB;
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
      filename: this.settings.dbPath + "cachedb.db",
      driver: sqlite3.Database,
    });
    if (!dbExists) {
      console.log(
        `Database at ${this.settings.dbPath} does not exist. Creating tables...`
      );
      await this.createTables(fileDB);
    }
    this.memoryDB = await this.#loadInMemoryDataBase(fileDB);
    console.log("Database backed up to in-memory database.");
    this.fileDB = fileDB;
    this.deleteExpiredCachesAsync();
  }
  async #loadInMemoryDataBase(fileDB) {
    try {
      const memoryDB = await open({
        filename: ":memory:",
        driver: sqlite3.Database,
      });
      memoryDB.getDatabaseInstance().serialize(() => {
        memoryDB.run(`
          CREATE TABLE memory_cache_result (
              id INTEGER,
              key TEXT,
              content TEXT,
              properties TEXT,
              storage_type INTEGER,
              profileid INTEGER,
              profiles TEXT,
              default_profile_id INTEGER,
              dmnid INTEGER,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
      `);
        fileDB.each(
          `
  SELECT 
    cr.id, 
    cr.key, 
    cr.content,
    cr.properties, 
    cr.storage_type, 
    cr.profileid, 
    hl.profiles, 
    hl.default_profile_id, 
    cr.dmnid
FROM 
    cache_results cr
JOIN 
    hosts_list hl ON cr.dmnid = hl.id;

      `,
          (err, row) => {
            if (err) throw err;
            memoryDB.run(
              `
              INSERT INTO memory_cache_result (id, content,key, properties, storage_type, profileid,profiles,default_profile_id,dmnid)
              VALUES (?, ?, ?, ?, ?,?,?,?,?);
          `,
              [
                row.id,
                row.content,
                row.key,
                row.properties,
                row.storage_type,
                row.profileid,
                row.profiles,
                row.default_profile_id,
                row.dmnid
              ]
            );
          }
        );
      });
      return memoryDB;
    } catch (error) {
      console.log(error.stack);
    }
  }

  /**
   *
   * @param {string} key
   * @param {string} useragent
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<CacheResult|null>}
   */
  async loadContentAsync(key, useragent, cancellationToken) {
    const useragentDetailsQuery = `SELECT * FROM  user_devices  WHERE useragent = ?`;
    const useragentDetails = await this.#executeSqliteQuery(
      this.fileDB,
      useragentDetailsQuery,
      [useragent]
    );
    if (useragentDetails.length < 1) {
      return;
    }
    const query = `SELECT * FROM memory_cache_result WHERE key = ? AND profileid = ?`;
    let result = await this.#executeSqliteQuery(this.memoryDB, query, [
      key,
      useragentDetails[0].profileid,
    ]);
    if (result.length == 0 && !result[0]) {
      const urlprofilesQuery = `SELECT * FROM memory_cache_result WHERE key = ?`;
      result = await this.#executeSqliteQuery(this.memoryDB, urlprofilesQuery, [
        key,
      ]);
      if (!result[0]) return
      /** @type {Array<string>} */
      const hostProfiles = JSON.parse(result[0].profiles);
      if (hostProfiles.includes(useragentDetails[0].profileid)) return;
      const defaultCacheQuery = `SELECT * FROM memory_cache_result WHERE key = ? AND profileid = default_profile_id `;
      result = await this.#executeSqliteQuery(
        this.memoryDB,
        defaultCacheQuery,
        [key]
      );
      if (result.length == 0) return;
    }
    let retVal;
    try {
      result[0].content =
        result[0]?.storage_type == StorageTypeEnum.FileBase
          ? await fs.readFile(
            path.join(__dirname, "../../../", result[0]?.content)
          )
          : result[0].content;
      retVal = result[0];
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
    // try {
    let { assetExpireAfterDays, ownerId, dmnid } = cms.cms;
    let { domains, default_profile_id, expireAfter, profiles } =
      await this.#addOrUpdateHost(dmnid, ownerId);
    await this.#executeSqliteQuery(
      this.fileDB, `DELETE FROM cache_results WHERE key = ?`,
      [key]
    );
    const query = `INSERT INTO cache_results (key, content, properties , expire_at, dmnid  ,storage_type,profileid) VALUES (?, ?, ?,?,?,?,?)`;
    const inMemoryQuery = `INSERT INTO memory_cache_result (key,content,properties,dmnid,storage_type,default_profile_id,profileid,profiles) VALUES (?,?, ?,?,?,?,?,?)`;
    let filePath;
    let filename;
    if (this.settings.isFileBase) {
      filename =
        crypto.createHash("sha256").update(key).digest("hex") + ".bin";
      filePath = path.join(
        this.settings.filesPath,
        ownerId.toString(),
        dmnid.toString()
      );
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(path.join(filePath, filename), content);
    }
    const useragentDetailsQuery = `SELECT * FROM  user_devices  WHERE useragent = ?`;
    const useragentDetails = await this.#executeSqliteQuery(
      this.fileDB,
      useragentDetailsQuery,
      [cms.request["user-agent"]]
    );
    await this.#executeSqliteQuery(this.fileDB, query, [
      key,
      this.settings.isFileBase ? path.join(filePath, filename) : content,
      JSON.stringify(properties),
      assetExpireAfterDays,
      dmnid,
      this.settings.isFileBase ? 1 : 0,
      useragentDetails[0].profileid ?? 1
    ]);
    await this.#executeSqliteQuery(this.memoryDB, inMemoryQuery, [
      key,
      this.settings.isFileBase ? path.join(filePath, filename) : content,
      JSON.stringify(properties),
      dmnid,
      this.settings.isFileBase ? 1 : 0,
      default_profile_id,
      useragentDetails[0].profileid ?? 1,
      JSON.stringify(profiles)
    ]);
    // } catch (err) {
    //   throw new Error("error in add cache  : " + err);
    // }
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
      console.error("Error creating directories:", error);
      throw new BasisCoreException("Error creating directories", error);
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

      const result = await db.all(query, params);
      return result
    } catch (err) {
      console.error("Error running query:", query, err.message);
      throw new BasisCoreException("Error running query", err, params);
    }
  }
  async deleteExpiredCachesAsync() {
    const selectQuery = `SELECT *
FROM cache_results cr
JOIN hosts_list hl ON cr.dmnid = hl.id
WHERE cr.storage_type = 1
  AND (
    (cr.expire_at IS NOT NULL AND DATE(cr.created_at, '+' || cr.expire_at || ' days') < DATE('now'))
    OR (cr.expire_at IS NULL AND DATE(cr.created_at, '+' || hl.expire_date || ' days') < DATE('now'))
  );

`;
    const result = await this.#executeSqliteQuery(
      this.fileDB,
      selectQuery,
      []
    );
    const deleteInMemoryCachePromises = [];
    const deleteFilePromises = result.map((element) => {
      try {
        deleteInMemoryCachePromises.push(
          this.#executeSqliteQuery(
            this.memoryDB,
            "DELETE FROM memory_cache_result WHERE key = ? AND profileid = ?",
            [element.key, element.profileid]
          )
        );
        if (element.storage_type == 1) return fs.unlink(element.content);
      } catch (err) {
        console.log(
          `file not found or no access to tis file : ${element.content}`
        );
      }
    });
    await Promise.all(deleteFilePromises);
  }

  /** @returns {Promise<void>} */
  async deleteAllCache() {
    return await this.#executeSqliteQuery(
      this.memoryDB`DELETE FROM cache_results`,
      []
    );
  }
  async extendOwnerhostsExpireDate(ownerId, newExpireDateString) {
    this.#executeSqliteQuery(
      db,
      `UPDATE hosts_list
        SET expire_date = ${newExpireDateString}
        WHERE owner_id = ${ownerId}
      `,
      []
    );
  }

  async createTables(db) {
    await this.#executeSqliteQuery(
      db,
      `
CREATE TABLE IF NOT EXISTS cache_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT,
    content TEXT,
    properties TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expire_at number,
    dmnid INTEGER,
    profileid INTEGER,
    storage_type INTEGER,
    FOREIGN KEY (dmnid) REFERENCES hosts_list(id) ON DELETE CASCADE
);
 `,
      []
    );
    await this.#executeSqliteQuery(
      db,
      `
CREATE TABLE IF NOT EXISTS user_devices (
    id INTEGER PRIMARY KEY,
    useragent TEXT,
    profileid INTEGER,
    lastupdate TEXT
);
 `,
      []
    );
    const latestdevice = await this.#executeSqliteQuery(
      db,
      `
      SELECT *
      FROM user_devices
      ORDER BY lastupdate DESC
      LIMIT 1;`,
      []
    );
    this.latestCacheUpdateDateStr = latestdevice[0]?.lastupdate ?? undefined;
    await this.#executeSqliteQuery(
      db,
      `
    CREATE TABLE IF NOT EXISTS hosts_list (
    id INTEGER PRIMARY KEY UNIQUE,
    expire_date number,
    owner_expire_date DATETIME,
    is_caching_allowed INTEGER,
    owner_id INTEGER,
    profiles TEXT,
    default_profile_id INTEGER,
    domains STRING
 ); `,
      []
    );
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
            AND cr.storage_type = 1;`;
    let expiredCaches = await this.#executeSqliteQuery(
      this.fileDB,
      selectQuery,
      []
    );
    const deleteFilePromises = expiredCaches.map(async (element) => {
      try {
        await this.#executeSqliteQuery(
          this.memoryDB,
          "DELETE FROM memory_cache_result WHERE key = ? && profileid = ?",
          [element.key, element.profileid]
        );
        if (element.storage_type == 1) {
          return fs.unlink(element.content);
        }
      } catch (err) {
        console.log(
          `unexpected error to delete ${element.content}. file deleted or the webserver have no access to delete the cache.`
        );
      }
    });
    await promise.all(deleteFilePromises);
    await this.#executeSqliteQuery(
      this.fileDB`DELETE 
      cr
      FROM 
      cache_results cr
      JOIN 
      hosts_list hl ON cr.dmnid = hl.id
      WHERE 
      cr.expire_at < CURRENT_TIMESTAMP;`,
      []
    );
    const query = `DELETE FROM hosts_list WHERE expire_date <= CURRENT_TIMESTAMP`;
    await this.#executeSqliteQuery(this.fileDB, query, []);
  }
  /**
   *
   * @param {number} dmnId
   * @param {number} ownerId
   * @returns {Promise<{default_profile_id : number,expireAfter : string,domains : string}>}
   */
  async #addOrUpdateHost(dmnId, ownerId) {
    const existingHost = await this.#executeSqliteQuery(
      this.fileDB,
      "SELECT * FROM hosts_list WHERE id = ?",
      [dmnId]
    );
    if (existingHost.length == 0) {
      let hostDetailResponse = await fetch(this.settings.hostDetailsApiUrl, {
        body: JSON.stringify({
          dmnId,
          ownerId,
        }),
        method: "POST"
      });
      const hostDetailData = await hostDetailResponse.json();
      if (this.settings.isFileBase) {
        console.log(`create sub-directories`);
        this.#createDirectories(
          this.settings.filesPath,
          ownerId.toString(),
          dmnId.toString()
        );
      }

      await this.#executeSqliteQuery(
        this
          .fileDB, `INSERT INTO hosts_list (id, expire_date, is_caching_allowed, owner_id, owner_expire_date,profiles,default_profile_id,domains) 
            VALUES (?, ?, ?, ?, ?,?,?,?)`,
        [
          dmnId,
          hostDetailData.defaultCacheExpire,
          hostDetailData.isCachingAllowed,
          ownerId,
          hostDetailData.expireAt,
          JSON.stringify(hostDetailData.profiles),
          hostDetailData.defaultIndexID,
          JSON.stringify(hostDetailData.domains),
        ]
      );
      return {
        default_profile_id: hostDetailData.defaultIndexID,
        expireAfter: hostDetailData.defaultCacheExpire,
        domains: hostDetailData.domains,
        profiles: hostDetailData.profiles,
      };
    }
    return {
      default_profile_id: existingHost[0].default_profile_id,
      expireAfter: existingHost[0].defaultCacheExpire,
      domains: existingHost[0].domains,
      profiles: JSON.parse(existingHost[0].profiles),
    };
  }
  async changeHostCacheExpire(numberOfDays, dmnid) {
    const query = `
    UPDATE hosts_list
    SET expire_at = DATETIME(created_at, ?)
    WHERE id = ?;
    `;
    await this.#executeSqliteQuery(this.fileDB, query, [numberOfDays, dmnid]);
  }
  async changeOwnerCacheExpire(numberOfDays, dmnid) {
    const query = `
    UPDATE hosts_list
    SET owner_expire_at = DATETIME(created_at, ?)
    WHERE id = ?;
    `;
    await this.#executeSqliteQuery(this.fileDB, query, [numberOfDays, dmnid]);
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
    await this.#executeSqliteQuery(this.fileDB, query, [numberOfDays, key]);
  }
  async addUserAgentsAsync() {
    let pagesize = 30;
    let isFetchRequired = true;
    while (isFetchRequired) {
      let response = await fetch(
        this.settings.UserAgentsApiUrl + "?pagesize=" + pagesize,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            lastUpdateDate: this.latestCacheUpdateDateStr ?? undefined,
          }),
        }
      );
      /** @type {IChanges} */
      const data = await response.json();
      if (data.edited.length > 0) {
        await this.#upsertDataAsync(db, data.edited, "edit");
      }
      if (data.added.length > 0) {
        await this.#upsertDataAsync(db, data.added, "insert");
      }
      if (data.added.length + data.edited.length < pagesize) {
        isFetchRequired = false;
      }
    }
    this.latestCacheUpdateDateStr = this.compareFormattedDates(
      data.added[data.added.length - 1],
      data.edited[data.edited.length - 1]
    );
  }

  /**
   *
   * @param {sqlite3.Database} db
   * @param {Array<Object>} dataArray
   * @param {"insert"|"edit"} mode
   */
  async #upsertDataAsync(db, dataArray, mode) {
    const insertSql = `INSERT INTO user_devices (id, profileid, useragent,lastupdate) VALUES (?,?, ?,?)`;
    const updateSql = `UPDATE user_devices SET lastupdate = ?,profileid = ?, useragent = ? WHERE id = ?`;
    db.serialize(() => {
      dataArray.forEach((data) => {
        const { id, deviceid, useragent, lastupdate } = data;

        if (mode === "insert") {
          db.run(
            insertSql,
            [id, deviceid, useragent, lastupdate],
            function (err) {
              if (err) {
                console.error("Insert error:", err.message);
              } else {
                console.log(`Inserted row with id ${this.lastID}`);
              }
            }
          );
        } else if (mode === "edit") {
          db.run(
            updateSql,
            [lastupdate, deviceid, useragent, id],
            function (err) {
              if (err) {
                console.error("Update error:", err.message);
              } else {
                console.log(`Updated row with id ${id}`);
              }
            }
          );
        } else {
          console.error('Invalid mode. Use "insert" or "edit".');
        }
      });
    });
  }
}
