import DebugStep from "./DebugStep.js";

export default class WaitStep  {
  constructor(owner, title, offset) {
   // super(owner, title, offset);
  }

  complete() {
    this._stopwatch.stop();
    console.log(
      `Wait For ${this.Title} ${this._stopwatch.elapsedMilliseconds} ms`
    );
    this.Completed = true;
  }

  failed() {
    if (!this.completed) {
      this._stopwatch.stop();
      console.log(
        `Timeout In Wait For ${this.Title} ${this._stopwatch.elapsedMilliseconds} ms`
      );
    }
  }
}
