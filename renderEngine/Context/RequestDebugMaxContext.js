import RequestDebugContext from "./RequestDebugContext.js";

export default class RequestDebugMaxContext extends RequestDebugContext {
  /**
   *
   * @param {string} title
   * @param {string} requestId
   * @param {LightgDebugStep} lightgDebugStep
   * @param {NodeJS.Dict<string>}settings
   * @param {NodeJS.Dict<string>} routingData
   * @param {NodeJS.Dict<string>} cms
   */
  constructor(title, requestId, lightgDebugStep, settings, routingData, cms) {
    super(title, requestId, lightgDebugStep, routingData, cms);
    this.addDebugInformation("Host Service Configuration", {
      value: JSON.stringify(settings),
    });
  }
}
