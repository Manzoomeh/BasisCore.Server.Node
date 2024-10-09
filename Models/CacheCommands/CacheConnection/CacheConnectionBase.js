import cron from 'node-cron';

export default class CacheConnectionBase {
  /**
   * @param {string} key
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<CacheResult|null>}
   */
  async loadContentAsync(key, cancellationToken) { }
  /**
   * @returns {Promise<void>}
   */
  async initializeAsync() {
    //runs every 24hours
    cron.schedule('0 12 * * *', () => {
      console.log('Running the daily expired cache cleanup task...');
      this.deleteExpiredCachesAsync();
      this.deleteExpiredCachehostsAsync()

    })
  }
  /**
   * @param {string} key
   * @param {string} content
   * @param {NodeJS.Dict<string>} properties
   * @param {NodeJS.Dict<any} cms
   * @returns {Promise<void>}
   */
  async addCacheContentAsync(key, content, properties, cms) {}
  /** @returns {Promise<void>} */
  async deleteAllCache() { }
  /** @returns {Promise<void>} */
  async deleteExpiredCachesAsync() { }
  /** @returns {Promise<void>} */
  async deleteExpiredCachehostsAsync() { }
  /** @returns {Promise<void>} */
  async extendOwnerhostsExpireDate() { }
  /**
   * 
   * @param {number} numberOfDays 
   * @param {number} dmnid 
   * @returns {Promise<void>}
   */
  async changeHostCacheExpire(numberOfDays, dmnid) { }
  /**
   * 
   * @param {number} numberOfDays 
   * @param {string} key 
   * @returns {Promise<void>}
   */
  async changeAssetCacheExpire(numberOfDays, key) { }
}
