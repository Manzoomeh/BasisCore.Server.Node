export default class Stopwatch {
  constructor() {
      this.startTime = 0;
      this.running = false;
      this.elapsed = 0;
  }

  start() {
      if (!this.running) {
          this.startTime = Date.now() - this.elapsed;
          this.running = true;
      }
  }

  stop() {
      if (this.running) {
          this.elapsed = Date.now() - this.startTime;
          this.running = false;
      }
  }

  reset() {
      this.elapsed = 0;
      this.startTime = 0;
      this.running = false;
  }

  restart() {
      this.elapsed = 0;
      this.startTime = Date.now();
      this.running = true;
  }

  get elapsedMilliseconds() {
      if (this.running) {
          return Date.now() - this.startTime;
      } else {
          return this.elapsed;
      }
  }

  static getTimestamp() {
      return Date.now();
  }

  static startNew() {
      const stopwatch = new Stopwatch();
      stopwatch.start();
      return stopwatch;
  }

  static  Frequency = 1000;
  static  IsHighResolution = false;
}