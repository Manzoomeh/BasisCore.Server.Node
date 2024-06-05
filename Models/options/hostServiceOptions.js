import IStreamerEngineOptions from "./IStreamerEngineOptions.js";
import CacheSettings from "./CacheSettings.js";

export default class HostServiceOptions {
  /**@type {"Sql"|"Edge"|"File"} */
  Type;
  /**@type {number} */
  ReadBodyTimeOut;
  /**@type {number} */
  ProcessTimeOut;
  /**@type {number} */
  MaxBodySize;
  /**@type {number} */
  MaxMultiPartSize;
  /**@type {IStreamerEngineOptions} */
  Streamer;
  /**@type {NodeJS.Dict<any>} */
  Settings;
  /**@type {CacheSettings}*/
  CacheSettings;
}
