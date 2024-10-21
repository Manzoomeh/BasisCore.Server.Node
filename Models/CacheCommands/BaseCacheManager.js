import CacheConnectionBase from "./CacheConnection/CacheConnectionBase.js";
export default class BaseCacheManager {
  /**@type {CacheConnectionBase}*/
  connection;
  channel;

  /**@param {CacheConnectionBase} */
  constructor(connectionInfo, settings) {
    this.connection = connection;
    this.settings = settings;
  }

  /**
   * @returns {Promise<void>}
   */
  connectAsync() {}
}
