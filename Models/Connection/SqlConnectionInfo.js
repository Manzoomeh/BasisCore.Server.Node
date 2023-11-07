import sql from "mssql";
import ConnectionInfo from "./ConnectionInfo.js";
import SqlSettingData from "./SqlSettingData.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";

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
    //"Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true"
    await sql.connect(
      this.settings.connectionString +
        (this.settings.requestTimeout
          ? `;requestTimeout=${this.settings.requestTimeout}`
          : "")
    );
    const request = new sql.Request();
    for (const key in parameters) {
      if (Object.hasOwnProperty.call(parameters, key)) {
        const value = parameters[key];
        if (typeof value === "object") {
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
    return new Promise((resolve, reject) => {
      request.execute(this.settings.procedure, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(new DataSourceCollection(result.recordsets));
        }
      });
    });
  }
}
