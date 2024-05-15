import DebugContext from "./DebugContext.js";
import StringBuilder from "../Models/StringBuilder.js";
import LightgDebugStep from "../Models/LightgDebugStep.js";
import WaitStep from "../Models/WaitStep.js";
import DebugStep from "../Models/DebugStep.js";
export default class RequestDebugContext extends DebugContext {
  /**
   * @type {string}
   */
  _requestId;
  /**
   *
   * @param {string} title
   * @param {string} requestId
   * @param {LightgDebugStep} lightgDebugStep
   * @param {NodeJS.Dict<string>} routingData
   * @param {NodeJS.Dict<string>} cms
   */
  constructor(title, requestId, lightgDebugStep, routingData, cms) {
    super(title, lightgDebugStep, routingData, cms);
    this._requestId = requestId;
    if (lightgDebugStep) {
      this.steps.push(lightgDebugStep);
    }
    if (lightgDebugStep.completed) {
      this.logs.push({
        dateTime: this.formatDate(Date.now()),
        type: "Debug",
        message: `${lightgDebugStep.title} In ${lightgDebugStep.elapsedMilliseconds} ms`,
        extraData: "",
      });
    }
  }
  /**
   * @param {string} title
   * @returns {WaitStep}
   */
  newWait(title) {
    const retVal = new WaitStep(
      this,
      title,
      this.stopWatch.elapsedMilliseconds
    );
    this.steps.push(retVal);
    return retVal;
  }
  /**
   *
   * @param {string} title
   * @returns {DebugStep}
   */
  newStep(title) {
    const retVal = new LightgDebugStep(
      this,
      title,
      this.stopWatch.elapsedMilliseconds
    );
    this.steps.push(retVal);
    return retVal;
  }

  async writeAsync(stream, cancellationToken) {
    await RequestDebugContext.DEBUG_CSS.writeAsync(stream, cancellationToken);
    await this.writeLogAsync(stream, cancellationToken);
    await super.writeAsync(stream, cancellationToken);
    if (this.tableCollection) {
      const tablesPromises = this.tableCollection.map(async (table) => {
        return table._result.writeAsync(stream, cancellationToken);
      });
      await Promise.all(tablesPromises);
    }
  }

  async writeLogAsync(stream, cancellationToken) {
    const logs = this.getChildLogs(this).sort(
      (a, b) => a.DateTime - b.DateTime
    );
    const sb = new StringBuilder();
    sb.append(
      `<code><table class='cms-data-member'><thead><tr><th colspan='4'>Log(s) For Request Id ${this._requestId} (Processed In ${this.stopWatch.elapsedMilliseconds} ms) </th></tr><tr>`
    );
    sb.append(
      `<th>Time</th><th>Type</th><th>Message</th><th>Data</th></tr></thead><tbody>`
    );
    for (const log of logs) {
      sb.append(
        `<tr class=${log.type.toLowerCase()}><td>${log.dateTime}</td><td>${
          log.type
        }</td><td>${log.message}</td><td>${log.extraData}</td></tr>`
      );
    }
    sb.append("</tbody></table><code>");
    await stream.push(Buffer.from(sb.toString(), "utf8"));
  }

  /** @param {DebugContext} debugContext */
  getChildLogs(debugContext) {
    const retVal = debugContext.childCollection.flatMap((x) =>
      this.getChildLogs(x)
    );
    return debugContext.logs.concat(retVal);
  }
  newStep(title) {
    return new LightgDebugStep(this, title);
  }

  newWait(title) {
    return new WaitStep(this, title);
  }
  newContext(title) {
    const retVal = new DebugContext(title, this);
    this.childCollection.push(retVal);
    return retVal;
  }
}
