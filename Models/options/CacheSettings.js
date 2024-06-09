export default class CacheSettings {
  /**@type {string[]} */
  responseHeaders;
  /**@type {string[]} */
  requestMethods;
  /** @type {boolean} */
  isEnabled;
  //for now is rabbit
  /** @type {"Rabbit"} */
  utilType
  /**@type { NodeJS.Dict<string> } */
  utilSetting
}
