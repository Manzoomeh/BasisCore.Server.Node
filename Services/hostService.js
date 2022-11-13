import { RequestDispatcher } from "../endPoint/endPoints.js";

class HostService extends RequestDispatcher {
  /**
   * @param {string} name
   */
  constructor(name) {
    super();
    this._name = name;
  }

  processAsync(cms) {
    throw new Error("Not implemented!");
  }
}

export default HostService;
