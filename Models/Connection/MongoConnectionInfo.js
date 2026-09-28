import { MongoClient } from "mongodb";
import { MongoClient as LegacyMongoClient } from "mongodb-server-3";
import ConnectionInfo from "./ConnectionInfo.js";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";
import Request from "./../request.js";
import IMongoSettingData from "./IMongoSettingData.js";
import BasisCoreException from "../Exceptions/BasisCoreException.js";
export default class MongoConnectionInfo extends ConnectionInfo {
  /** @type {IMongoSettingData} */
  settings;
  /**@param {MongoClient} client */
  client;

  /**
   * @param {string} name
   * @param {IMongoSettingData} settings
   * @param {MongoClient} client
   */
  constructor(name, settings) {
    super(name);
    this.settings = settings;
    this.client = new MongoClient(this.settings.endpoint);
  }

  /**
   * @param {NodeJS.Dict<object|string|number>} parameters
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<DataSourceCollection>}
   */
  async loadDataAsync(parameters, cancellationToken) {
    try {
      await this.client.connect();
      const db = this.client.db(this.settings.dataBase);
      const collection = db.collection(this.settings.collection);
      if (typeof collection[this.settings.method] != "function") {
        throw new BasisCoreException("invalid method");
      }
      const result = await collection[this.settings.method](this.settings.query)
      return new DataSourceCollection([await result.toArray()]);
    } catch (err) {
      throw err;
   }
    finally {
    await this.client.close();
    }
  }

  /**
   * @param {string} databaseName
   * @param {string} collectionName
   * @param {object} document
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<any>}
   */
  async insertOneAsync(
    databaseName,
    collectionName,
    document,
    cancellationToken
  ) {
    cancellationToken?.throwIfCancellationRequested?.();
    // Use a per-operation client so concurrent tracking requests cannot close
    // the shared client while another request is inserting.
    // Tracking still targets a MongoDB 3.2 deployment (wire version 4).
    // Keep the legacy-compatible driver isolated to this insert operation;
    // the application's normal MongoDB client remains on the current driver.
    const client = new LegacyMongoClient(this.settings.endpoint);
    await client.connect();
    try {
      const configuredDatabase = this.settings.dataBase || this.settings.database;
      const dbName = databaseName || configuredDatabase;
      if (!dbName) {
        throw new BasisCoreException(
          `Mongo connection '${this.name}' requires a database name.`
        );
      }
      if (!collectionName) {
        throw new BasisCoreException(
          `Mongo connection '${this.name}' requires a collection name.`
        );
      }
      const result = await client
        .db(dbName)
        .collection(collectionName)
        .insertOne(document);
      return result.insertedId;
    } finally {
      await client.close();
    }
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async testConnectionAsync() {
    try{
      await this.client.connect()
      return true
    }catch(err){
      return false
    }finally{
      await this.client.close()
    }
  }
}
