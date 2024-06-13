import HostService from "./hostService.js";
import Request from "../models/request.js";
import Response from "../models/response.js";
import RouterOptions from "./RouterOptions.js";
import { ServiceSelectorPredicateOptions } from "../models/model.js";
import Logger from "../Log/LoggerUtil.js";

export default class RouterHostService extends HostService {
  /** @type {RouterOptions[]} */
  #routes;
  /**
   * @param {string} name
   * @param {ServiceSelectorPredicateOptions} options
   * @param {HostService[]} services
   */
  constructor(name, options, services) {
    super(name);
    this.#routes = [];
    options.Items.forEach((option) => {
      const service = services.find((x) => x.name == option.Service);
      if (service) {
        this.#routes.push(new RouterOptions(service, option));
      } else {
        console.log(`host service '${option.service}' not found!`);
      }
    });
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async processAsync(request, fileContents, logger) {
    for (const route of this.#routes) {
      if (route.isMatch(request)) {
        return await route.service.processAsync(request, fileContents);
      }
    }
    logger.log({
      level: "error",
      message: "Not suitable service found!",
    });
    throw new Error("Not suitable service found!");
  }
}
