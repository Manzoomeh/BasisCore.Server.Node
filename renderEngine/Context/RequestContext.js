import ServiceSettings from "../../models/ServiceSettings.js";
import ContextBase from "./ContextBase.js";
import ConnectionInfo from "../../models/Connection/ConnectionInfo.js";
import DataSourceCollection from "../Source/DataSourceCollection.js";
import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";
import Util from "../../Util.js";
import CommandBase from "../Command/CommandBase.js";
import CommandUtil from "../../test/command/CommandUtil.js";
import LocalContext from "./LocalContext.js";
import IRoutingRequest from "../../models/IRoutingRequest.js";
import JsonSource from "../Source/JsonSource.js";
import CookieItem from "../Models/CookieItem.js";
import IContext from "./IContext.js";
import IDebugContext from "./IDebugContext.js";

export default class RequestContext extends ContextBase {
  /** @type {ServiceSettings} */
  _settings;
  /** @type {Array<CookieItem>} */
  _cookies;
  /**
   * @param {ServiceSettings} settings
   * @param {IRoutingRequest} request
   */
  constructor(settings, request,debugContext) {
    super(null, Number(request.cms?.dmnid),debugContext);
    this._settings = settings;
    this.isSecure = request.isSecure;
    for (let mainKey in request) {
      const mainValue = request[mainKey];
      this.addSource(new JsonSource([mainValue], `cms.${mainKey}`));
    }
    let cookieObj =
      typeof request.webserver.cookie === "object"
        ? request.webserver.cookie
        : {};

    if (request.request.cookie) {
      request.request.cookie.split(";").forEach((element) => {
        const [key, value] = element.split("=");
        cookieObj[key] = value;
      });
    }
    this.addSource(new JsonSource([cookieObj], "cms.cookie"));
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
    try {
      parameters.dmnid = this.domainId;
      /** @type {ConnectionInfo} */
      const connection = this._settings.getConnection(connectionName);
      /** @type {DataSourceCollection} */
      const result = await connection.loadDataAsync(
        parameters,
        this.cancellation
      );
      this.debugContext.addDebugInformation(sourceName, result.items);
      return result;
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
   * @param {string} name
   * @param {string} value
   * @param {string} maxAge
   * @param {string} path
   */
  addCookie(name, value, maxAge, path) {
    if (!this._cookies) {
      this._cookies = [];
    }
    this._cookies.push(
      new CookieItem(name, value, maxAge, path, this.isSecure)
    );
  }
}
