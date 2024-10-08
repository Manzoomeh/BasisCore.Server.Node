import ServiceSettings from "../../models/ServiceSettings.js";
import ContextBase from "./ContextBase.js";
import ConnectionInfo from "../../models/Connection/ConnectionInfo.js";
import DataSourceCollection from "../Source/DataSourceCollection.js";
import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";
import Util from "../../Util.js";
import CommandBase from "../Command/CommandBase.js";
import LocalContext from "./LocalContext.js";
import UnknownCommand from "../Command/UnknownCommand.js";
import VoidContext from "./VoidContext.js";
import CancellationToken from "../Cancellation/CancellationToken.js";

export default class TestContext extends ContextBase {
  /** @type {ServiceSettings} */
  _settings;
  /**@type {Object.<string, any>}*/
  _commands;
  /**
   * @param {ServiceSettings} settings
   * @param {number} domainId
   * @param {Object.<string, any>} commands
   */
  constructor(settings, domainId, commands) {
    super(null, domainId, new VoidContext("nothing"));
    this._settings = settings;
    this.isSecure = false;
    this._commands = commands;
    this.cancellation = new CancellationToken();
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
    return this.createCommand(JSON.parse(result.page_il), this._commands);
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

  /**
   * @param {Object} commandIl
   * @returns {CommandBase}
   */
  createCommand(commandIl) {
    /** @type {CommandBase?} */
    let retVal = null;
    const CommandClass = this._commands[commandIl.$type.toLowerCase()]?.default;
    if (CommandClass) {
      return new CommandClass(commandIl);
    } else {
      retVal = new UnknownCommand(commandIl);
    }
    return retVal;
  }
}
