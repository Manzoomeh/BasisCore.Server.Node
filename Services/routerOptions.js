import HostService from "./hostService.js";
import { ServiceSelectorPredicateItemOptions } from "../Models/model.js";

export default class RouterOptions {
  /**@type {HostService} */
  service;
  /**@type {string} */
  pattern;
  /**@type {RegExp} */
  #url;
  /**@type {boolean} */
  empty;

  /**
   *
   * @param {HostService} service
   * @param {ServiceSelectorPredicateItemOptions|null} options
   */
  constructor(service, options) {
    this.service = service;
    this.empty = true;
    this.pattern = "default";
    const urlPattern = options?.Url || options?.url;
    if (urlPattern) {
      this.pattern = urlPattern;
      this.#url = new RegExp(urlPattern, "i");
      this.empty = false;
    }
  }

  /**
   * @param {Request} request
   * @returns {boolean}
   */
  isMatch(request) {
    let isMatch = false;
    if (this.empty) {
      isMatch = true;
    } else {
      if (this.#url.test(request.FullUrl)) {
        isMatch = true;
      }
    }
    return isMatch;
  }
}
