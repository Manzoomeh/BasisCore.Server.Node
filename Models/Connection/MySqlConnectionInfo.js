import mySql from "mysql2";
import ConnectionInfo from "./ConnectionInfo.js";
import MySqlSettingData from "./MySqlSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import ExceptionResult from "../../renderEngine/Models/ExceptionResult.js";
import WebServerException from "../Exceptions/WebServerException.js";
import MysqlRow from "../mysqlRow.js";
export default class MySqlConnectionInfo extends ConnectionInfo {
  /** @type {MySqlSettingData} */
  settings;

  /**
   * @param {string} name
   * @param {MySqlSettingData} settings
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
    /** @type {mySql.Pool?} */
    let pool = null;
    pool = mySql.createPool({
      host: this.settings.host,
      user: this.settings.password,
      database: this.settings.database,
    });
    pool.getConnection(async (err, connection) => {
      if (err) {
        throw err;
      }
      const input = {};
      for (const key in parameters) {
        if (Object.hasOwnProperty.call(parameters, key)) {
          const value = parameters[key];
          if (!Array.isArray(value)) {
            /**@typedef {Object} keyValue
             * @property {string} name
             * @property {string} value
             */
            /** @type keyValue[]*/
            const tvp = [];
            for (const field in value) {
              if (Object.hasOwnProperty.call(value, field)) {
                const fieldValue = value[field];
                /**@type keyValue */
                let temp = {};
                temp.name = field;
                temp.value = fieldValue;
                tvp.push(temp);
              }
            }
            input[key] = tvp;
          } else {
            input[key] = value;
          }
        }
      }
      return new DataSourceCollection(
        await this.executeProcedure(connection, this.settings.procedure, input)
      );
    });
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IDataSource>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    /*** @type {MysqlRow[]} */
    const params = [];
    for (const type in request) {
      const group = request[type];
      for (const name in group) {
        if (name === "query") {
          const query = group[name];
          for (const key in query) {
            params.push(new MysqlRow(name, key, query[key].toString()));
          }
        } else {
          params.push(new MysqlRow(type, name, group[name].toString()));
        }
      }
    }
    const result = await this.loadDataAsync(
      { params: params },
      cancellationToken
    );
    const retVal = {};
    result.items[0].data.forEach((row) => {
      if (!retVal[row.ParamType]) {
        retVal[row.ParamType] = {};
      }
      retVal[row.ParamType][row.ParamName] = row.ParamValue;
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
    /** @type {mySql.ConnectionPool?} */
    let pool = null;
    pool = mySql.createPool({
      host: this.settings.host,
      user: this.settings.user,
      password :this.settings.password,
      database: this.settings.database,
    });
    pool.getConnection(async (err, connection) => {
      if (err) {
        throw err;
      }
      const rows = await this.executeProcedure(
        connection,
        this.settings.procedure,
        pageName,
        domainId,
        pageSize,
        rawCommand
      );
      if (rows.length != 1) {
        throw new WebServerException(
          `Call Command Expect 1 File '${pageName}' But Get ${rows.length} File(s) From '${this.settings.procedure}' Procedure`
        );
      }
      return rows[0];
    });
  }
  /**
   * Executes a stored procedure with the provided parameters using a MySQL connection.
   * @param {import('mysql2').PoolConnection} connection
   * @param {string} procedureName
   * @param {Array} parameters
   * @returns {Promise<any>}
   * @throws {Error}
   */
  executeProcedure(connection, procedureName, parameters) {
    return new Promise((resolve, reject) => {
      const query = `CALL ${procedureName}(${parameters
        .map(() => "?")
        .join(",")})`;
      connection.query(query, parameters, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    });
  }
}

