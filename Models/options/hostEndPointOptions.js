import PortListenerOptions from "./portListenerOptions.js";
import ServiceSelectorPredicateOptions from "./ServiceSelectorPredicateOptions.js";
import CacheSettings from "./CacheSettings.js";
export default class HostEndPointOptions {
  /**@type {"http" | "webSocket"} */
  Type;
  /** @type {string} */
  id;
  /**@type {PortListenerOptions[]} */
  Addresses;
  /**@type {number} */
  MaxHeaderSize;
  /**@type {boolean} */
  Active;
  /**@type {ServiceSelectorPredicateOptions|string} */
  Routing;
  /** @type {number} */
  ReadHeaderTimeOut;
  /** @type {CacheSettings} */
  CacheSettings;
}
