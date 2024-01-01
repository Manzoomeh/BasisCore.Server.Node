import sqlite3 from "sqlite3";
import ConnectionInfo from "./ConnectionInfo.js";
import SqliteSettingData from "./SqliteSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "../request.js";
import ExceptionResult from "../../renderEngine/Models/ExceptionResult.js";
import WebServerException from "../Exceptions/WebServerException.js";
import { AsyncDatabase } from "promised-sqlite3";
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
    let database;
    try {
      database = await AsyncDatabase.open("./test.db");
      const result = await database.run(this.settings.query);
      console.log(result);
      const retVal = new DataSourceCollection(result);
      return retVal;
    } finally {
      database.close();
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
}
