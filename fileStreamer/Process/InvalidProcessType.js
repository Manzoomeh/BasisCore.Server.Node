import Status from "../Models/Status.js";
import IProcess from "./IProcess.js";

export default class InvalidProcessType extends IProcess {
  /**@type {string} */
  _type;
  /**
   * @param {string} type
   */
  constructor(type) {
    super();
    this._type = type;
  }

  /**
   * @param {BinaryContent[]} contents
   * @returns {Promise<BinaryContent[]>}
   */
  async processAsync(contents) {
    for (const content of contents) {
      content.AddLog("process-type", this._type);
      content.status = Status.InvalidProcessTypeError;
    }
    return Promise.resolve(contents);
  }

  toString() {
    return `InvalidProcessType - ${this._type}`;
  }
}
