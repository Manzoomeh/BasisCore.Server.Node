import { CancellationToken } from "mongodb";
import StringResult from "../Models/StringResult.js";
import DebugStep from "../Models/DebugStep.js";
import WaitStep from "../Models/WaitStep.js";
/**
 * @typedef {('None'|'MIN'|'MAX')} DebugMode - Levels of debug
 */

export default class LogContext {
  /**@type {string} */
  title;
  /** @type {DebugMode}*/
  debugMode;
  /** @type {StringResult[]} */
  infoCollection;
  /**@type {StringResult} */
  static DEBUG_CSS = new StringResult(`
<style>
.cms-data-member{ direction:ltr; text-align:left; margin-top:20px;}
.cms-data-member tr th
{
    min-width:100px;
    background-color: #eee;
    height: 50px;
    border: 1px solid #bbb;
    vertical-align: middle;
    text-align:center
}
.cms-data-member tbody tr td
{
    background-color: #fff;
    border: 1px solid #bbb;
    vertical-align: middle;
    padding:0px 5px 0px 5px !important
}
.cms-data-member tbody tr.information td
{
    background-color: lightblue !important;
}
.cms-data-member tbody tr.error td
{
    background-color: #fefe !important;
}
.cms-data-member tbody tr.warning td
{
    background-color: lightyellow !important ;
}
</style>
`);

  /**
   * @param {string} title
   */
  constructor(title) {
    this.title = title;
    this.infoCollection = [];
  }

  newContext(title) {
    return this;
  }

  addDebugInformation(title,debugInfo) {
    this.infoCollection.push(title,debugInfo);
  }
  /**
   *
   * @param {string[]} stream
   * @param {CancellationToken} cancellationToken
   */
  async writeAsync(stream, cancellationToken) {
    for (const info of this.infoCollection) {
      await info.writeAsync(stream, cancellationToken);
    }
  }

  log(logLevel, eventId, state, exception, formatter) {
    // this.logger.log(logLevel, eventId, state, exception, formatter);
  }

  isEnabled(logLevel) {
    // return this.logger.isEnabled(logLevel);
  }

  beginScope(state) {
    // return this.logger.beginScope(state);
  }

  complete() {
    throw new Error("Abstract method 'Complete' not implemented.");
  }

  failed() {
    throw new Error("Abstract method 'Failed' not implemented.");
  }
  /**@param {Date} date */
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
