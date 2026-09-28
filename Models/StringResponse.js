import { StatusCodes } from "http-status-codes";
import Response from "./Response.js";

export default class StringResponse extends Response {
  /**
   * @param {string} body
   * @param {NodeJS.Dict<string|number|string[]>} headers
   * @param {number} statusCode
   */
  constructor(body, headers = {}, statusCode = StatusCodes.OK) {
    super();
    this.body = body;
    this.headers = headers;
    this.statusCode = statusCode;
  }

  /**
   * @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync() {
    return [this.statusCode, this.headers, this.body];
  }
}
