import { MongoClient } from "mongodb";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "./../request.js";
import IMongoSettingData from "./IMongoSettingData.js";
import BasisCoreException from "../Exceptions/BasisCoreException.js";
import IRoutingRequest from "../IRoutingRequest.js";
import { http } from "winston";
export default class MongoConnectionInfo extends ConnectionInfo {
  /**@type {MongoClient}  */
  client;
  /** @type {IMongoSettingData} */
  settings;

  /**
   * @param {string} name
   * @param {IMongoSettingData} settings
   * @param {MongoClient} client
   */
  constructor(name, settings) {
    super(name);
    this.client = new MongoClient(settings.address);
    this.settings = settings;
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    try {
      await this.client.connect();
      const { collectionName, dbname } = parameters;
      const db = this.client.db(dbname);
      const collection = db.collection(collectionName);
      if (typeof collection[this.settings.method] != "function") {
        throw new BasisCoreException("invalid method");
      }
      const result = await collection[this.settings.method](
        this.settings.query
      );
      return new DataSourceCollection([await result.toArray()]);
    } catch (err) {
      throw err;
    } finally {
      await this.client.close();
    }
  }
  /**
   * Insert a document into a MongoDB collection.
   * @param {string} sourceName
   * @param {string} connectionName
   * @param {string} databaseName
   * @param {string} collectionName
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async insertAsync(
    sourceName,
    connectionName,
    databaseName,
    collectionName,
    data
  ) {
    try {
      if (!databaseName) {
        databaseName = this.settings.databaseName;
      }
      await this.client.connect();

      const database = client.db(databaseName);
      const collection = database.collection(collectionName);

      const result = await collection.insertOne(data);
      await client.close();
      return result._id;
    } catch (error) {
      throw new Error(
        `Error in loading data for '${sourceName}' source command from '${connectionName}' connection: ${error.message}`
      );
    }
  }
  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async testConnectionAsync() {
    try {
      await this.client.connect();
      return true;
    } catch (err) {
      return false;
    } finally {
      await this.client.close();
    }
  }
}
