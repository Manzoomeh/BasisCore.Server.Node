export default class Request {
  /** @type {NodeJS.Dict<string|string[]>} */
  cms;
  /** @type {NodeJS.Dict<string|string[]>} */
  request;

  /**
   * @returns {string}
   */
  get Url() {
    return this.request["url"];
  }

  /**
   * @returns {string}
   */
  get FullUrl() {
    return this.request["full-url"];
  }
}
