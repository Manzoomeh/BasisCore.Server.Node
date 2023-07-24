import CancellationToken, { CANCEL } from "../Cancellation/CancellationToken";

export default class CancellationTokenSource {
  constructor() {
    this.token = new CancellationToken();
  }

  cancel() {
    this.token[CANCEL]();
  }
}
