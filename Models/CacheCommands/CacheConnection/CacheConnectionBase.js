export default class CacheConnectionBase {
  /**
   * @param {string} key
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<CacheResult|null>}
   */
  async loadContentAsync(key, cancellationToken) {}

  /**
   * @param {string} key
   * @param {string} content
   * @param {NodeJS.Dict<string>} properties
   * @returns {Promise<void>}
   */
  async addCacheContentAsync(key, content, properties) {}

  /** @returns {Promise<void>} */
  async deleteAllCache() {}
}
