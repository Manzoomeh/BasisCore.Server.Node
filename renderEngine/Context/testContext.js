import ServiceSettings from "../../models/ServiceSettings.js";
import ContextBase from "./ContextBase.js";
import ConnectionInfo from "../../models/Connection/ConnectionInfo.js";
import DataSourceCollection from "../Source/DataSourceCollection.js";
import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";
import Util from "../../Util.js";
import CommandBase from "../Command/CommandBase.js";
import CommandUtil from "../../test/command/CommandUtil.js";
import LocalContext from "./LocalContext.js";

export default class TestContext extends ContextBase {
  /** @type {ServiceSettings} */
  _settings;

  /**
   * @param {ServiceSettings} settings
   * @param {number} domainId
   */
  constructor(settings, domainId) {
    super(null, domainId);
    this._settings = settings;
    this.isSecure = false;
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
      const connection = this._settings.getConnection(connectionName);
      /** @type {DataSourceCollection} */
      return await connection.loadDataAsync(parameters, this.cancellation);
    } catch (ex) {
      throw new BasisCoreException(
        `Error in load data for '${sourceName}' source from '${connectionName}' connection.`,
        ex
      );
    }
  }

  /**
   * @param {string} key
   * @param {string?} defaultValue
   * @returns {string}
   */
  getDefault(key, defaultValue = null) {
    return this._settings.getDefault(key, defaultValue);
  }

  /**
   * @param {string} pageName
   * @param {string} rawCommand
   * @param {string} pageSize
   * @param {number} callDepth
   * @return {Promise<CommandBase>}
   */
  async loadPageAsync(pageName, rawCommand, pageSize, callDepth) {
    const result = await this._settings.callConnection.loadPageAsync(
      pageName,
      rawCommand,
      pageSize,
      this.domainId,
      this.cancellation
    );
    if (result.il_call == 1 || Util.isNullOrEmpty(result.page_il)) {
      //TODO: IL must implement
    }
    /** @type {CommandBase} */
    return CommandUtil.createCommand(JSON.parse(result.page_il));
  }

  /**
   * @param {string} connectionName
   * @returns {Promise<boolean>} */
  checkConnectionAsync(connectionName) {
    /** @type {ConnectionInfo} */
    const connection = this._settings.getConnection(connectionName);
    return connection.testConnectionAsync();
  }

  /**
   * @param {string} title
   * @returns {IContext}
   */
  createContext(title) {
    const retVal = new LocalContext(this);
    retVal.isSecure = this.isSecure;
    return retVal;
  }

  /**
   * @param {string} name
   * @param {string} value
   * @param {string} maxAge
   * @param {string} path
   */
  addCookie(name, value, maxAge, path) {}
}
