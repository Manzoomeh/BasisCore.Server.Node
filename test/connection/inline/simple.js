import HostManager from "../../../hostManager.js";
import IRoutingRequest from "../../../models/IRoutingRequest.js";
import { HostManagerOptions } from "../../../models/model.js";
import Request from "../../../models/request.js";

class SimpleInlineProvider {
  /**
   * @param {Request} httpRequest
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IDataSource>}
   */
  getRoutingDataAsync(httpRequest, cancellationToken) {
    const d = new Date();
    const rawTextIl = {
      $type: "rawtext",
      content: `<h1>hi In ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}<h1>`,
    };
    /** @type {IRoutingRequest} */
    const result = {
      ...httpRequest,
      ...{
        webserver: {
          headercode: "200 OK",
          index: "1",
          mime: "text/html",
        },
      },
    };
    result.cms.page_il = JSON.stringify(rawTextIl);

    return Promise.resolve(result);
  }
}

/** @type {HostManagerOptions} */
const host = {
  Lazy: true,
  EndPoints: {
    Main06: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "127.0.0.1:1563",
        },
      ],
      Active: true,
      Routing: "mainService",
    },
  },
  Services: {
    mainService: {
      Type: "http",
      Settings: {
        "Connections.inline.RoutingData": new SimpleInlineProvider(),
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
