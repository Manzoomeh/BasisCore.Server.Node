import DebugContext from "../Context/DebugContext.js";
import Stopwatch from "./StopWatch.js";

export default class DebugStep {
  /**@type {Stopwatch} */
  _stopwatch;
  /**@type {DebugContext} */
  _owner;
  /** @type {number} */
  Offset;
  /** @type {boolean}*/
  completed;
  /** @type {string} */
  title;
  /**@type {Date} */
  _start;
  /**
   * @param {DebugContext} owner
   * @param {string} title
   * @param {number} offset
   */
  constructor(owner, title, offset) {
    this._stopwatch = new Stopwatch();
    this._owner = owner;
    this.offset = offset;
    this.completed = false;
    this.title = title;
    this._start = new Date();
    this._stopwatch.start();
  }

  /**@returns {Date} */
  get start() {
    return this._start;
  }

  /**
   * @param {any} value
   */
  set start(value) {
    this._start = value;
  }

  /**@returns {String} */
  get title() {
    return this._title;
  }

  /**@param {string} value  */
  set title(value) {
    this._title = value;
  }

  /**@returns {boolean} */
  get completed() {
    return this._completed;
  }

  /**@param {boolean} value */
  set completed(value) {
    this._completed = value;
  }

  complete() {
    this._stopwatch.stop();
    console.log(`${this.title} In ${this._stopwatch.elapsedMilliseconds} ms`);
    this.completed = true;
  }

  failed() {
    if (!this.completed) {
      this._stopwatch.stop();
    }
  }
  formatDate(date) {
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "UTC",
    });
    return formatter.format(date);
  }
}
