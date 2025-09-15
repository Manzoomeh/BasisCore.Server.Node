import ContextBase from "./ContextBase.js";

export default class LocalContext extends ContextBase {
  /** @type {ContextBase} */
  _owner;

  /**
   * @param {ContextBase} owner
   */
  constructor(owner) {
    super(owner.repository, owner.domainId,owner.debugContext);
    this._owner = owner;
    this.cancellation = owner.cancellation;
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
   * @param {string} sourceName
   * @param {string} connectionName
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(sourceName, connectionName, parameters) {
    return this._owner.loadDataAsync(sourceName, connectionName, parameters);
  }

  /**
   * @param {string} key
   * @param {string?} defaultValue
   * @returns {string}
   */
  getDefault(key, defaultValue = null) {
    return this._owner.getDefault(key, defaultValue);
  }

  /**
   * @param {string} pageName
   * @param {string} rawCommand
   * @param {string} pageSize
   * @param {number} callDepth
   * @return {Promise<CommandBase>}
   */
  async loadPageAsync(pageName, rawCommand, pageSize, callDepth) {
    return this._owner.loadPageAsync(pageName, rawCommand, pageSize, callDepth);
  }

  /**
   * @param {string} connectionName
   * @returns {Promise<boolean>} */
  checkConnectionAsync(connectionName) {
    return this._owner.checkConnectionAsync(connectionName);
  }

  /**
   * @param {string} name
   * @param {string} value
   * @param {string} maxAge
   * @param {string} path
   */
  addCookie(name, value, maxAge, path) {
    this._owner.addCookie(name, value, maxAge, path);
  }
  /**
   * @param {Object} commandIl
   * @returns {CommandBase}
   */
  createCommand(commandIl) {
    return this._owner.createCommand(commandIl);
  }
}
