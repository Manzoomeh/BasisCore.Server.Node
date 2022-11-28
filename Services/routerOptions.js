import RequestDispatcher from "./requestDispatcher.js";

export default class RouterOptions {
  /**@type {RequestDispatcher} */
  Service;
  /**@type {RegExp} */
  Url;
  /**@type {boolean} */
  Empty;

  /**
   *
   * @param {RequestDispatcher} service
   * @param {string|null} url
   */
  constructor(service, url) {
    this.Service = service;
    if (url == null) {
      this.Empty = true;
    }
    this.Url = new RegExp(url, "i");
  }
}
