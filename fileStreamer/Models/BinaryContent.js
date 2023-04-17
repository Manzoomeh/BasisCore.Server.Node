import Logger from "./Logger.js";
import Status from "./Status.js";

export default class BinaryContent {
  /**@type {string} */
  name;
  /**@type {string} */
  mime;
  /**@type {Buffer} */
  payload;
  /**@type {Status} */
  _status = Status.NotSet;
  /**@type {Logger} */
  _logger = new Logger();
  /**@type {BinaryContent[]} */
  _children = [];
  /** @type {BinaryContent} */
  parent;

  /**@returns {BinaryContent} */
  clone() {
    const retVal = new BinaryContent();
    retVal.name = this.name;
    retVal.mime = this.mime;
    retVal.payload = this.payload;
    retVal._status = Status.NotSet;
    retVal.parent = this;
    this._children.push(retVal);
    return retVal;
  }

  get status() {
    return this._status;
  }

  set status(value) {
    this._status = value;
    this.AddLog("status", this._status);
  }
  /**
   * @returns {boolean}
   */
  processedByChild() {
    let retVal = this.status != Status.NotSet;
    if (!retVal) {
      for (const element of this._children) {
        retVal = element.processedByChild();
        if (retVal) {
          break;
        }
      }
    }
    return retVal;
  }

  /**
   * @param {string} title
   * @param {string} value
   */
  AddLog(title, value) {
    this._logger.add(title, value);
  }

  /**@returns {string} */
  toString() {
    return `${this.name}, ${this.mime}, ${this.payload.length} (${this.status})`;
  }

  /**
   *
   * @returns {NodeJS.Dict<object>}
   */
  getLogs() {
    /**@type {NodeJS.Dict<object>} */
    const retVal = {};
    this._addNodeLog(this, retVal);
    return retVal;
  }

  /**
   *
   * @param {BinaryContent} node
   * @param {NodeJS.Dict<object>} logs
   */
  _addNodeLog(node, logs) {
    if (node.parent) {
      this._addNodeLog(node.parent, logs);
    }
    node._logger.addLogs(logs);
  }
}
