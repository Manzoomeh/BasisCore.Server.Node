import ServiceSettings from "../../Models/ServiceSettings.js";
import ContextBase from "./ContextBase.js";
import ConnectionInfo from "../../Models/Connection/ConnectionInfo.js";
import DataSourceCollection from "../Source/DataSourceCollection.js";
import BasisCoreException from "../../Models/Exceptions/BasisCoreException.js";
import Util from "../../Util.js";
import CommandBase from "../Command/CommandBase.js";
import LocalContext from "./LocalContext.js";
import IRoutingRequest from "../../Models/IRoutingRequest.js";
import JsonSource from "../Source/JsonSource.js";
import CookieItem from "../Models/CookieItem.js";
import IContext from "./IContext.js";
import IDebugContext from "./IDebugContext.js";
import UnknownCommand from "../Command/UnknownCommand.js";
import CommandUtil from "../CommandUtil.js";
import { Encoder } from "node-html-encoder";

const encoder = new Encoder("entity");

const IL_PARSER_URL = String(
  process.env.IL_PARSER_URL || "http://ilparser:8080/ilparser"
).trim();

export default class RequestContext extends ContextBase {
  /** @type {ServiceSettings} */
  _settings;

  /** @type {IRoutingRequest} */
  _request;

  /** @type {Array<CookieItem>} */
  _cookies;

  /**
   * Shared registry for commands that must run only once per request.
   * TrackingCommand uses this map to avoid duplicate Mongo inserts when
   * the render engine evaluates the same command more than once.
   * @type {Map<string, Promise<any>>}
   */
  __executedTrackingCommands;

  /**
   * @param {ServiceSettings} settings
   * @param {IRoutingRequest} request
   * @param {Object.<string, any>} commands
   * @param {IDebugContext} debugContext
   */
  constructor(settings, request, commands, debugContext) {
    super(null, Number(request.cms?.dmnid), debugContext);

    this._settings = settings;
    this._request = request;
    this.isSecure = request.isSecure;
    this._commands = commands;
    this.__executedTrackingCommands = new Map();

    for (const mainKey in request) {
      const mainValue = request[mainKey];
      this.addSource(new JsonSource([mainValue], `cms.${mainKey}`));
    }

    const cookieObj =
      typeof request.webserver?.cookie === "object" &&
      request.webserver.cookie !== null
        ? request.webserver.cookie
        : {};

    if (request.request?.cookie) {
      request.request.cookie.split(";").forEach((element) => {
        const separatorIndex = element.indexOf("=");

        if (separatorIndex === -1) {
          return;
        }

        const key = element.slice(0, separatorIndex).trim();
        const value = element.slice(separatorIndex + 1);

        if (key) {
          cookieObj[key] = value;
        }
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
   * Request-wide sources are stored in the root repository. SourceRepository
   * propagates them to all existing child repositories.
   * @param {IDataSource} dataSource
   */
  addGlobalSource(dataSource) {
    this.addSource(dataSource);
  }

  /**
   * @param {string} sourceName
   * @param {string} connectionName
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {string[]} memberNames
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(sourceName, connectionName, parameters, memberNames) {
    try {
      parameters.dmnid = this.domainId;

      /** @type {ConnectionInfo} */
      const connection = this._settings.getConnection(connectionName);

      /** @type {DataSourceCollection} */
      const result = await connection.loadDataAsync(
        parameters,
        this.cancellation
      );

      result.items.forEach((item, index) => {
        this.debugContext.addDebugInformation(
          `${sourceName}.${memberNames[index]}`,
          item.data
        );
      });

      return result;
    } catch (ex) {
      throw new BasisCoreException(
        `Error in load data for '${sourceName}' source from '${connectionName}' connection.`,
        ex
      );
    }
  }

  /**
   * Creates the document that will be stored by the tracking command.
   * MongoDB adds the _id field when insertOne is executed.
   *
   * @returns {object}
   */
  createTrackingDocument() {
    const source = this._request ?? {};

    let cloned;

    try {
      cloned =
        typeof structuredClone === "function"
          ? structuredClone(source)
          : JSON.parse(JSON.stringify(source));
    } catch (error) {
      throw new BasisCoreException(
        "Could not clone the current request for tracking.",
        error
      );
    }

    // This is an internal runtime field and should not be persisted.
    delete cloned.isSecure;

    return {
      ...cloned,
      DomainId: String(this.domainId ?? ""),
    };
  }

  /**
   * Inserts one document through a configured Mongo connection.
   *
   * For this command:
   * dbname="tracking" resolves to Connections.mongo.tracking.
   *
   * @param {string} connectionName
   * @param {string} databaseName
   * @param {string} collectionName
   * @param {object} document
   * @returns {Promise<any>}
   */
  async insertMongoDocumentAsync(
    connectionName,
    databaseName,
    collectionName,
    document
  ) {
    if (!connectionName) {
      throw new BasisCoreException(
        "Mongo connection name is required for tracking."
      );
    }

    if (!collectionName) {
      throw new BasisCoreException(
        "Mongo collection name is required for tracking."
      );
    }

    const connection = this._settings.getConnection(connectionName);

    if (!connection || typeof connection.insertOneAsync !== "function") {
      throw new BasisCoreException(
        `Connection '${connectionName}' does not support MongoDB inserts.`
      );
    }

    return await connection.insertOneAsync(
      databaseName,
      collectionName,
      document,
      this.cancellation
    );
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
   * @returns {Promise<CommandBase>}
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
      const response = await fetch(IL_PARSER_URL, {
        body: result.content,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `ilparser returned ${response.status} ${
            response.statusText || ""
          }`.trim()
        );
      }

      const responseJson = await response.json();
      return this.createCommand(responseJson);
    }

    this.debugContext.addDebugInformation(
      `result from load page ${pageName}`,
      {
        content: encoder.htmlEncode(result.content),
      }
    );

    return this.createCommand(JSON.parse(result.page_il));
  }

  /**
   * @param {string} connectionName
   * @returns {Promise<boolean>}
   */
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

  /**
   * @param {Object} commandIl
   * @returns {CommandBase}
   */
  createCommand(commandIl) {
    /** @type {CommandBase?} */
    let retVal = null;

    if (!this._commands) {
      this._commands = CommandUtil.addDefaultCommands();
    }

    const commandType = commandIl?.$type?.toLowerCase();

    if (!commandType) {
      throw new BasisCoreException(
        "Command IL does not contain a valid '$type'."
      );
    }

    const CommandClass = this._commands[commandType]?.default;

    if (CommandClass) {
      return new CommandClass(commandIl);
    }

    retVal = new UnknownCommand(commandIl);
    return retVal;
  }
}
