import mime from "mime-types";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import Response from "./Response.js";

export default class FileResponse extends Response {
  /** @type {string}*/
  #path;

  /**
   * @param {string} path
   */
  constructor(path) {
    super();
    this.#path = path;
  }
  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync() {
    if (fs.existsSync(this.#path)) {
      const mimeType = mime.lookup(this.#path);
      const content = await fs.promises.readFile(this.#path);
      return [StatusCodes.OK, { "content-type": mimeType }, content];
    } else {
      return [StatusCodes.NOT_FOUND, {}, null];
    }
  }
}
