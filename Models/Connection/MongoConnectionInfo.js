import { MongoClient } from "mongodb";
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
