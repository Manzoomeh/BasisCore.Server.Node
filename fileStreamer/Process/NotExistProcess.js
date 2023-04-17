import Status from "../Models/Status.js";
import IProcess from "./IProcess.js";

export default class NotExistProcess extends IProcess {
  /**@type {string} */
  _name;
  /**
   * @param {string} name
   */
  constructor(name) {
    super();
    this._name = name;
  }

  /**
   * @param {BinaryContent[]} contents
   * @returns {Promise<BinaryContent[]>}
   */
  async processAsync(contents) {
    for (const content of contents) {
      content.AddLog("step-name", this._name);
      content.status = Status.StepNotFoundError;
    }
    return Promise.resolve(contents);
  }

  toString() {
    return `NotExistProcess - ${this._name}`;
  }
}
