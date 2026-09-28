import HostService from "./hostService.js";
import Request from "../Models/request.js";
import Response from "../Models/Response.js";
import StringResponse from "../Models/StringResponse.js";
import RouterOptions from "./routerOptions.js";
import { ServiceSelectorPredicateOptions } from "../Models/model.js";
import {
  traceRequest,
  getRequestTraceId,
  resolveClientIp,
  getForwardedFor,
} from "../modules/requestTrace.js";

export default class RouterHostService extends HostService {
  /** @type {RouterOptions[]} */
  #routes;
  /** @type {HostService[]} */
  #services;
  /**
   * @param {string} name
   * @param {ServiceSelectorPredicateOptions} options
   * @param {HostService[]} services
   */
  constructor(name, options, services) {
    super(name, { Type: "router", Settings: {} });
    this.#routes = [];
    this.#services = [];
    const routeItems = Array.isArray(options?.Items)
      ? options.Items
      : Array.isArray(options?.items)
      ? options.items
      : [];
    routeItems.forEach((option) => {
      const serviceName = option?.Service || option?.service;
      const service = services.find((x) => x.name == serviceName);
      if (service) {
        this.#routes.push(new RouterOptions(service, option));
        this.#services.push(service);
      } else {
        console.log(`host service '${serviceName}' not found!`);
      }
    });
  }

  async initializeAsync() {
    const initializedServices = new Set();
    for (const service of this.#services) {
      if (initializedServices.has(service.name)) {
        continue;
      }
      initializedServices.add(service.name);
      await service.initializeAsync();
    }
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  async processAsync(request, fileContents) {
    const requestUrl = request?.FullUrl || request?.Url || "";
    const traceId = getRequestTraceId(request);
    const clientIp = resolveClientIp(request);
    const forwardedFor = getForwardedFor(request);
    traceRequest("router.start", {
      traceId,
      requestUrl,
      routeCount: this.#routes.length,
      clientIp,
      forwardedFor,
    });
    for (const route of this.#routes) {
      const matched = route.isMatch(request);
      traceRequest("router.check", {
        traceId,
        requestUrl,
        pattern: route.pattern,
        service: route.service?.name || "",
        matched,
        clientIp,
        forwardedFor,
      });
      if (!matched) {
        continue;
      }
      traceRequest("router.matched", {
        traceId,
        requestUrl,
        pattern: route.pattern,
        service: route.service?.name || "",
        clientIp,
        forwardedFor,
      });
      return await route.service.processAsync(request, fileContents);
    }
    traceRequest(
      "router.no_match",
      {
        traceId,
        requestUrl,
        clientIp,
        forwardedFor,
      },
      "warn"
    );
    return new StringResponse(
      "Not Found",
      {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
      404
    );
  }
}
