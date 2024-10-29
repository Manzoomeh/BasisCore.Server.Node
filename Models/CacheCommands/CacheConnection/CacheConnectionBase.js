import cron from "node-cron";

export default class CacheConnectionBase {
  /** @type {string} */
  latestCacheUpdateDateStr;
  /**
   * @param {string} key
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<CacheResult|null>}
   */
  async loadContentAsync(key, cancellationToken) {}
  /**
   * @returns {Promise<void>}
   */
  async initializeAsync() {
    //runs every 24hours
    cron.schedule("0 12 * * *", () => {
      console.log("Running the daily expired cache cleanup task...");
      this.deleteExpiredCachesAsync();
      this.deleteExpiredCachehostsAsync();
      this.addUserAgentsAsync();
    });
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
  async deleteAllCache() {}
  /** @returns {Promise<void>} */
  async deleteExpiredCachesAsync() {}
  /** @returns {Promise<void>} */
  async deleteExpiredCachehostsAsync() {}
  /** @returns {Promise<void>} */
  async extendOwnerhostsExpireDate() {}
  /**
   *
   * @param {number} numberOfDays
   * @param {number} dmnid
   * @returns {Promise<void>}
   */
  async changeHostCacheExpire(numberOfDays, dmnid) {}

  formatDate() {
    let date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }
  convertSaveDateToJSDate(dateString) {
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, secondWithMillis] = timePart.split(":");
    const [second, millis] = secondWithMillis.split(".").map(Number);

    return new Date(year, month - 1, day, +hour, +minute, second, millis);
  }
  compareFormattedDates(date1, date2) {
    const dateObj1 = this.convertSaveDateToJSDate(date1);
    const dateObj2 = this.convertSaveDateToJSDate(date2);
    return dateObj1 > dateObj2 ? date1 : dateObj1 < dateObj2 ? date2: date1;
  }
  async addUserAgentsAsync() {}
  /**
   *
   * @param {number} numberOfDays
   * @param {string} key
   * @returns {Promise<void>}
   */
  async changeAssetCacheExpire(numberOfDays, key) {}
}
