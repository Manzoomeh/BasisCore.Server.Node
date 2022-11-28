import HostEndPointOptions from "./hostEndPointOptions.js";
import HostServiceOptions from "./hostServiceOptions.js";

export default class HostManagerOptions {
  /**@type {boolean} */
  Lazy;
  /**@type {NodeJS.Dict<HostEndPointOptions>} */
  EndPoints;
  /**@type {NodeJS.Dict<HostServiceOptions>} */
  Services;
}
