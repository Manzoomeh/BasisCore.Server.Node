import HostService from "./hostService.js";
import { ServiceSelectorPredicateItemOptions } from "../Models/model.js";

export default class RouterOptions {
  /**@type {HostService} */
  service;
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
    if (options?.Url) {
      this.#url = new RegExp(options.Url, "i");
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
