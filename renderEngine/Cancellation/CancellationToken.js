//https://gist.github.com/danharper/ad6ca574184589dea28d
export const CANCEL = Symbol();
export default class CancellationToken {
  constructor() {
    this.cancelled = false;
  }

  throwIfCancellationRequested() {
    if (this.isCancelled()) {
      throw "Cancelled!";
    }
  }

  isCancelled() {
    return this.cancelled === true;
  }

  [CANCEL]() {
    this.cancelled = true;
  }
}
