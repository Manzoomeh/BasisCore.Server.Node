import PortListenerOptions from "./portListenerOptions.js";
export default class HostEndPointOptions {
  /**@type {"http" | "webSocket"} */
  Type;
  /**@type {PortListenerOptions[]} */
  Addresses;
  /**@type {number} */
  MaxHeaderSize;
  /**@type {boolean} */
  Active;
  /**@type {} */
  Routing;
  /** @type {number} */
  ReadHeaderTimeOut;
}
