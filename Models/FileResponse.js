import mime from "mime-types";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import Response from "./Response.js";
import FileManagerBase from "../fileManager/fileManagerBase.js";
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
    
//    if (FileManagerBase.getCurrent().exists()) {
      const mimeType = mime.lookup(this.#path);
      const content = await FileManagerBase.getCurrent().readFileAsync(this.#path);
      console.log(content)
      return [StatusCodes.OK, { "content-type": mimeType }, content];
  //  } else {
      console.log(this.#path)
      return [StatusCodes.NOT_FOUND, {}, null];
    }
  //}
}
