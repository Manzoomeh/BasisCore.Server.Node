import SqliteCacheConnection from "./../CacheCommands/CacheConnection/SqliteCacheSetting.js"
export default class CacheSettings {
  /**@type {string[]} */
  responseHeaders;
  /**@type {string[]} */
  requestMethods;
  /** @type {boolean} */
  isEnabled;
  //for now is rabbit
  /** @type {"Rabbit"} */
  managerType
  /**@type { NodeJS.Dict<string> } */
  managerSetting
  /** @type {"sqlite"} */
  connectionType
  /** @type {SqliteCacheConnection} */
  connectionSetting
}
