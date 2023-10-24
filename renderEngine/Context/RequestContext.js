import ServiceSettings from "../../models/ServiceSettings.js";
import ContextBase from "./ContextBase.js";
import ConnectionInfo from "../../models/Connection/ConnectionInfo.js";
import DataSourceCollection from "../Source/DataSourceCollection.js";
import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";

export default class RequestContext extends ContextBase {
  /** @type {ServiceSettings} */
  _settings;
  /**
   * @param {ServiceSettings} settings
   */
  constructor(settings) {
    super();
    this._settings = settings;
  }

  /**
   * @param {string} sourceName
   * @param {string} connectionName
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(sourceName, connectionName, parameters) {
    try {
      /** @type {ConnectionInfo} */
      var connection = this._settings.getConnection(connectionName);
      /** @type {DataSourceCollection} */
      return await connection.loadDataAsync(parameters, this.cancellation);
    } catch (ex) {
      throw new BasisCoreException(
        `Error in load data for '${sourceName}' source from '${connectionName}' connection.`,
        ex
      );
    }
  }
}
