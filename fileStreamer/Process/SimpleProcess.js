import Status from "../Models/Status.js";
import IProcess from "./IProcess.js";

export default class SimpleProcess extends IProcess {
  /**@type {string} */
  _name;
  /**@type {IStep} */
  _step;
  /**@type {any} */
  _options;

  /**
   * @param {string} name
   * @param {any} options
   * @param {IStep} step
   */
  constructor(name, options, step) {
    super();
    this._name = name;
    this._step = step;
    this._options = options;
  }

  /**
   * @param {BinaryContent[]} contents
   * @returns {Promise<BinaryContent[]>}
   */
  async processAsync(contents) {
    if (contents.length > 0) {
      try {
        contents = await this._step.processAsync(contents, this._options);
      } catch (ex) {
        console.error(ex);
        for (const content of contents) {
          content.AddLog(this._name, false);
          content.AddLog(`${this._name}-error`, ex);
          content.status = Status.StepError;
        }
      }
    }
    return contents;
  }

  toString() {
    return this._name;
  }
}
