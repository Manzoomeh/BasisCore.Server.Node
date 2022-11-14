class Request {
  /**
   * @type {NodeJS.Dict<string|string[]>}
   */
  cms;
  /**
   * @type {NodeJS.Dict<string|string[]>}
   */
  request;

  /**
   * @returns {string}
   */
  get Url() {
    return this.request["url"];
  }
}

export default Request;
