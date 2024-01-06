import mySql from "mysql2";
import ConnectionInfo from "./ConnectionInfo.js";
import MySqlSettingData from "./MySqlSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import ExceptionResult from "../../renderEngine/Models/ExceptionResult.js";
import WebServerException from "../Exceptions/WebServerException.js";
import MysqlRow from "../mysqlRow.js";
import SqlSettingData from "./SqlSettingData.js";
export default class MySqlConnectionInfo extends ConnectionInfo {
  /** @type {mySql.Pool<SqlSettingData>} */
  pool;
  procedure;

  /**
   * @param {string} name
   * @param {MySqlSettingData} settings
   */
  constructor(name, settings) {
    super(name);
    this.pool = mySql
      .createPool({
        host: settings.host,
        user: settings.user,
        password: settings.password,
        database: settings.database,
      })
      .promise();
    this.procedure = settings.procedure;
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    try {
      const input = {};
      if (Object.keys(parameters.params).length != 0) {
        for (const key in parameters) {
          if (Object.hasOwnProperty.call(parameters, key)) {
            const value = parameters[key];
            if (!Array.isArray(value)) {
              const tvp = [];
              for (const field in value) {
                if (Object.hasOwnProperty(value, field)) {
                  const fieldValue = value[field];
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
          input.params
        );

        const procedureResult = await this.executeProcedure(
          this.procedure,
          "temp_table"
        );
        return new DataSourceCollection(procedureResult);
      } else {
        const procedureResult = await this.executeProcedure(this.procedure);
        return new DataSourceCollection([procedureResult[0][0]]);
      }
    } finally {
      // await this.pool.end();
    }
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

    if (result) {
      result.items[0].data[0].forEach((row) => {
        if (!retVal[row.paramType]) {
          retVal[row.paramType] = {};
        }

        retVal[row.paramType][row.paramKey] = row.paramValue;
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
    this.pool.getConnection(async (err, connection) => {
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
   * @param {string} procedureName
   * @param {Array} parameters
   * @returns {Promise<any>}
   * @throws {Error}
   */
  async executeProcedure(procedureName, parameters) {
    const query = `CALL ${procedureName}(${
      Array.isArray(parameters) ? parameters.map((param)=>{
        return "?"
      }).join(",") : ""
    })`;
    const results = await this.pool.query(query, parameters);
    return results;
  }

  async createTemporaryTableAndInsertData(tableName, dataArray) {
    const createTableQuery = `
      CREATE TEMPORARY TABLE IF NOT EXISTS ${tableName} (
        paramType VARCHAR(255),
        paramKey VARCHAR(255),
        paramValue VARCHAR(255)
      )
    `;
    await this.pool.query(createTableQuery);
    const dataToInsert = dataArray.map((item) => [
      item.type,
      item.name,
      item.value,
    ]);
    const insertQuery = `INSERT INTO ${tableName} (paramType, paramKey, paramValue) VALUES ?`;

    const results = await this.pool.query(insertQuery, [dataToInsert]);
    return results;
  }
}
