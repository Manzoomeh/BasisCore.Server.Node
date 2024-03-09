import sql from "mssql";
import ConnectionInfo from "./ConnectionInfo.js";
import SqlSettingData from "./SqlSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import WebServerException from "../Exceptions/WebServerException.js";
import IRoutingRequest from "../IRoutingRequest.js";

export default class SqlConnectionInfo extends ConnectionInfo {
  /** @type {SqlSettingData} */
  settings;

  /**
   * @param {string} name
   * @param {SqlSettingData} settings
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
    /** @type {sql.ConnectionPool?} */
    let pool = null;
    pool = await sql.connect(
      this.settings.connectionString +
        (this.settings.requestTimeout
          ? `;requestTimeout=${this.settings.requestTimeout}`
          : "")
    );
    const request = new sql.Request(pool);
    for (const key in parameters) {
      if (Object.hasOwnProperty.call(parameters, key)) {
        const value = parameters[key];
        if (typeof value === "object" && !(value instanceof sql.Table)) {
          const tvp = new sql.Table();
          tvp.columns.add("name", sql.NVarChar(4000));
          tvp.columns.add("value", sql.NVarChar());
          for (const field in value) {
            if (Object.hasOwnProperty.call(value, field)) {
              const fieldValue = value[field];
              tvp.rows.add(field, fieldValue);
            }
          }
          request.input(key, tvp);
        } else {
          request.input(key, value);
        }
      }
    }
    return new DataSourceCollection(
      (await request.execute(this.settings.procedure)).recordsets
    );
  }

  /**
   * @param {Request} request
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IRoutingRequest>}
   */
  async getRoutingDataAsync(request, cancellationToken) {
    const params = new sql.Table();

    params.columns.add("ParamType", sql.VarChar(50));
    params.columns.add("ParamName", sql.VarChar(100));
    params.columns.add("ParamValue", sql.VarChar);

    for (const type in request) {
      const group = request[type];
      for (const name in group) {
        if (name === "query") {
          const query = group[name];
          for (const key in query) {
            params.rows.add(name, key, query[key].toString());
          }
        } else {
          params.rows.add(type, name, group[name].toString());
        }
      }
    }
    const result = await this.loadDataAsync(
      { params: params },
      cancellationToken
    );
    /** @type {IRoutingRequest} */
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
    /** @type {sql.ConnectionPool?} */
    let pool = null;
    pool = await sql.connect(
      this.settings.connectionString +
        (this.settings.requestTimeout
          ? `;requestTimeout=${this.settings.requestTimeout}`
          : "")
    );
    const request = new sql.Request(pool);
    request.input("fileNames", pageName);
    request.input("dmnid", domainId);
    request.input("sitesize", pageSize);
    request.input("command", rawCommand);
    /** @type {Array<ILoadPageResult>} */
    const rows = (await request.execute(this.settings.procedure)).recordset;
    if (rows.length != 1) {
      throw new WebServerException(
        `Call Command Expect 1 File '${pageName}' But Get ${rows.length} File(s) From '${this.settings.procedure}' Procedure`
      );
    }
    return rows[0];
  }

  /**
   * @returns {boolean}
   */
  async testConnectionAsync() {
    try {
      await sql.connect(
        this.settings.connectionString +
          (this.settings.requestTimeout
            ? `;requestTimeout=${this.settings.requestTimeout}`
            : "")
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
