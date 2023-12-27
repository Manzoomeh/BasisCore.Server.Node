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
    return new Promise((resolve, reject) => {
      let pool = null;
      let result;
      pool = mySql.createPool({
        host: this.settings.host,
        user: this.settings.user,
        password: this.settings.password,
        database: this.settings.database,
      });

      pool.getConnection(async (err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const input = {};
          for (const key of parameters) {
            if (Object.hasOwnProperty.call(parameters, key)) {
              const value = parameters[key];
              if (!Array.isArray(value)) {
                const tvp = [];
                for (const field in value) {
                  if (Object.hasOwnProperty(value, field)) {
                    const fieldValue = value[field];
                    console.log(field, fieldValue);
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

          await this.createTemporaryTableAndInsertData(
            "temp_table",
            input.params,
            connection
          );

          const procedureResult = await this.executeProcedure(
            connection,
            this.settings.procedure,
            "temp_table"
          );

          result = new DataSourceCollection(procedureResult);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          // Make sure to release the connection back to the pool
          connection.release();
        }
      });
    });
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IDataSource>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    const params = [];
    for (const type in request) {
      const group = request[type];
      for (const name in group) {
        if (name === "query") {
          const query = group[name];
          for (const key in query) {
            const row = new MysqlRow(name, key, query[key].toString());
            params.push(row);
            
          }
        } else {
          const row = new MysqlRow(type, name, group[name].toString());
          params.push(row);
          
        }
      }
    }

    const result = await this.loadDataAsync(
      { params: params },
      cancellationToken
    );
    const retVal = {};

    if (result && result.items && result.items[0] && result.items[0].data) {
      result.items[0].data.forEach((row) => {
        if (!retVal[row.ParamType]) {
          retVal[row.ParamType] = {};
        }

        retVal[row.ParamType][row.ParamKey] = row.ParamValue;
      });
    }
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
      password: this.settings.password,
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
      const query = `CALL ${procedureName}()`;
      connection.query(query, parameters, (err, results) => {
        if (err) {
          reject(err);
        }
        resolve(results);
      });
    });
  }
  createTemporaryTableAndInsertData(tableName, dataArray, connection) {
    return new Promise((resolve, reject) => {
      const createTableQuery = `
      CREATE TEMPORARY TABLE IF NOT EXISTS ${tableName} (
        paramType VARCHAR(255),
        paramKey VARCHAR(255),
        paramValue VARCHAR(255)
      )
    `;
      connection.query(createTableQuery, (err, results) => {
        if (err) {
          return reject(err);
        }
        const dataToInsert = dataArray.map((item) => [
          item.type,
          item.key,
          item.value,
        ]);
        const insertQuery = `INSERT INTO ${tableName} (paramType, paramKey, paramValue) VALUES ?`;

        connection.query(insertQuery, [dataToInsert], (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        });
      });
    });
  }
}
