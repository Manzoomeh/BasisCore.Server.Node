import RequestDebugContext from "./RequestDebugContext.js";

export default class RequestDebugMaxContext extends RequestDebugContext {
  /**
   *
   * @param {string} title
   * @param {string} requestId
   * @param {LightgDebugStep} lightgDebugStep
   * @param {NodeJS.Dict<string>}settings
   * @param {NodeJS.Dict<string>} routingData 
   */
  constructor(title, requestId, lightgDebugStep, settings, routingData) {
    super(title, requestId, lightgDebugStep,routingData);
    this.addDebugInformation("Host Service Configuration", {value : JSON.stringify(settings)});
  }
}
