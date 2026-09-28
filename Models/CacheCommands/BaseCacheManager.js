import CacheConnectionBase from "./CacheConnection/CacheConnectionBase.js";
export default class BaseCacheManager {
  /**@type {CacheConnectionBase}*/
  connectionInfo;
  channel;

  /**@param {CacheConnectionBase} */
  constructor(connectionInfo, settings) {
    this.connectionInfo = connectionInfo;
    this.settings = settings;
  }

  /**
   * @returns {Promise<void>}
   */
  connectAsync() {}
}
