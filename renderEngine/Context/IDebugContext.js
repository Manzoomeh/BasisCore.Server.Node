import DebugContext from "./DebugContext.js";
import DebugStep from "../Models/DebugStep.js";
import WaitStep from "../Models/WaitStep.js";
export default class IDebugContext {
  
  /** @type {StringResult[]} */
  tableCollection;

  constructor(title) {
    this.title = title;
    this.debugMode = "None";
  }
  /**
   *
   * @param {string} title
   * @returns {DebugStep}
   */
  newStep(title) {
    return new DebugStep(title);
  }
  /**
   * @param {string} title
   * @returns {WaitStep}
   */
  newWait(title) {
    return new DebugStep(title);
  }

  newContext(title) {
    return new DebugContext(title);
  }
  /**
   * @param {string} title
   * @param {NodeJS.Dict<string>} info
   * @returns {void}
   */
  addDebugInformation(title, info) {}

  get debugMode() {
    return this._debugMode;
  }

  set debugMode(mode) {
    this._debugMode = mode;
  }
  /** @returns {StringResult[]} */
  get tables() {}
}
