import IWebServer from "./IWebServer.js";

export default class IRoutingRequest {
  /** @type {NodeJS.Dict<string|string[]>} */
  cms;
  /** @type {NodeJS.Dict<string|string[]>} */
  request;
  /** @type {IWebServer} */
  webserver;
  /** @type {boolean} */
  isSecure;
}
