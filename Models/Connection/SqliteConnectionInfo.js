import sqlite3 from "sqlite3";
import ConnectionInfo from "./ConnectionInfo.js";
import SqliteSettingData from "./SqliteSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import ExceptionResult from "../../renderEngine/Models/ExceptionResult.js";
import WebServerException from "../Exceptions/WebServerException.js";
import Param from "../param.js";
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
    let db;
    const requestTimeout = setTimeout(() => {
      throw new ExceptionResult("Query execution timed out");
    }, this.settings.requestTimeout);
    try {
      db = new sqlite3.Database(this.settings.dbPath);
      const request = {};
      for (const key in parameters) {
        if (Object.hasOwnProperty.call(parameters, key)) {
          const value = parameters[key];
          if (Array.isArray(value)) {
            const tvp = {};
            for (const element of value) {
              tvp[element.name] = element.value;
            }
            request[key] = tvp;
          } else {
            request[key] = value;
          }
        }
      }

      const retVal = new DataSourceCollection(
        await this.executeProcedureAsync(
          db,
          this.settings.procedure,
          parameters
        )
      );
      clearTimeout(requestTimeout);
      return retVal;
    } finally {
      db?.close();
    }
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IDataSource>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    /**
     * @type {Param[]}
     */
    const params = [];
    for (const type in request) {
      const group = request[type];
      for (const name in group) {
        if (name === "query") {
          const query = group[name];
          for (const key in query) {
            params.push(new Param(name, key, query[key].toString()));
          }
        } else {
          params.push(new Param(type, name, group[name].toString()));
        }
      }
    }
    const result = await this.loadDataAsync(
      { params: params },
      cancellationToken
    );
    const retVal = {};
    result.items[0].data.forEach((row) => {
      if (!retVal[row.type]) {
        retVal[row.type] = {};
      }
      retVal[row.type][row.name] = row.value;
    });
    return retVal;
  }

  /**
   * @param {string} pageName
   * @param {string} rawCommand
   * @param {number} pageSize
   * @param {number} domainId
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<ILoadPageResult>}
   */
  async loadPageAsync(
    pageName,
    rawCommand,
    pageSize,
    domainId,
    cancellationToken
  ) {
    /** @type {sqlite3.ConnectionPool?} */
    let db = null;
    try {
      db = new sqlite3.Database(this.settings.dbPath);
      const input = {
        fileNames: pageName,
        dmnid: domainId,
        siteSize: pageSize,
        command: rawCommand,
      };
      /** @type {Array<ILoadPageResult>} */
      const rows = await this.executeProcedureAsync(
        db,
        this.settings.procedure,
        input
      );
      if (rows.length != 1) {
        throw new WebServerException(
          `Call Command Expect 1 File '${pageName}' But Get ${rows.length} File(s) From '${this.settings.procedure}' Procedure`
        );
      }
      return rows[0];
    } finally {
      db.close();
    }
  }
  /**
   *
   * @param {sqlite3.Database} db
   * @param {string} procedureName
   * @param {NodeJS.Dict<string>} parameters
   */
  async executeProcedureAsync(db, procedureName, parameters) {
    const procedureParameters = await this.getProcedureParameters(
      db,
      procedureName
    );

    const orderedParameters = procedureParameters.filter(
      (param) => param !== "result"
    );
    orderedParameters.push("result");
    const placeholders = orderedParameters.map((param) => `$${param}`);
    const query = `CALL ${procedureName}(${placeholders.join(", ")})`;
    const statement = db.prepare(query);
    statement.bind(parameters);
    statement.run();
    statement.finalize();
    db.get(
      "SELECT $result as result",
      { $result: parameters.result },
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.result);
        }
      }
    );
  }
  async getProcedureParameters(db, procedureName) {
    return new Promise((resolve, reject) => {
      db.get(`PRAGMA procedure_info(${procedureName})`, (err, row) => {
        if (err) {
          reject(err);
        } else {
          const parameters = row ? row.arguments.split(", ") : [];
          resolve(row);
        }
      });
    });
  }
  createTable(db, tableName, columns) {
    return new Promise((resolve, reject) => {
      const columnDefinitions = Object.entries(columns)
        .map(([name, type]) => `${name} ${type}`)
        .join(", ");

      const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions});`;

      db.run(createTableQuery, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  addRowToTable(db, tableName, data) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(data).join(", ");
      const values = Object.values(data)
        .map((value) => `'${value}'`)
        .join(", ");

      const insertQuery = `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;

      db.run(insertQuery, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
