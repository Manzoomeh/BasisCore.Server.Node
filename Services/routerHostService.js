import HostService from "./hostService.js";
import Request from "../models/request.js";
import Response from "../models/response.js";
import RouterOptions from "./RouterOptions.js";

export default class RouterHostService extends HostService {
  /** @type {RouterOptions[]} */
  #routes;
  /**
   * @param {string} name
   * @param {RouterOptions[]} routes
   */
  constructor(name, routes) {
    super(name);
    this.#routes = routes;
  }

  /**
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async processAsync(request) {
    for (const route of this.#routes) {
      if (this.#isMatch(route, request)) {
        return await route.Service.processAsync(request);
      }
    }
    throw new Error("Not suitable service found!");
  }

  /**
   * @param {RouterOptions} route
   * @param {Request} request
   * @returns {boolean}
   */
  #isMatch(route, request) {
    if (route.Empty) {
      return true;
    } else {
      const url = request.FullUrl;
      console.log(url, route.Url.test(url));
      if (route.Url.test(url)) {
        return true;
      }
    }
    return false;
  }
}
