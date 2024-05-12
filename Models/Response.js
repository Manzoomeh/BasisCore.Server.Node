import LightgDebugStep from "../renderEngine/Models/LightgDebugStep.js";

export default class Response {
  /**
   * @param {LightgDebugStep|undefined} routingDataStep
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  getResultAsync(routingDataStep) {
    throw new Error("not implemented");
  }
}
