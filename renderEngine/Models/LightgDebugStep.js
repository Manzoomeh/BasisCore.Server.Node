import Stopwatch from "./StopWatch.js";
import DebugStep from "./DebugStep.js";

export default class LightgDebugStep extends DebugStep {
  constructor(owner,title) {
    super(owner,title)
    this.title = title;
    this.stopwatch = new Stopwatch();
    this.elapsedMilliseconds = 0;
    this.completed = false;
    this.stopwatch.start();
  }
  toString() {
    return this.title;
  }
  complete() {
    this.stopwatch.stop();
    this._owner?.logs.push({
      dateTime: this.formatDate(this._start),
      message: `${this.title} In ${this._stopwatch.elapsedMilliseconds} ms`,
      type: "Debug",
      extraData: "",
    });
    this.completed = true;
  }

  failed() {
    if (!this.completed) {
      this._owner.logs.push({
        dateTime: this.formatDate(this._start),
        message: `failed ${this.title} In ${this._stopwatch.elapsedMilliseconds} ms`,
        type: "Debug",
        extraData: "",
      });
      this._stopwatch.stop();
    }
  }

}
