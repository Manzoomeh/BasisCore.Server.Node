import CancellationToken, { CANCEL } from "../Cancellation/CancellationToken.js";

export default class CancellationTokenSource {
  constructor() {
    this.token = new CancellationToken();
  }

  cancel() {
    this.token[CANCEL]();
  }
}
