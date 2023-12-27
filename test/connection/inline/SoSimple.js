import HostManager from "../../../hostManager.js";
import IRoutingRequest from "../../../models/IRoutingRequest.js";
import { HostManagerOptions } from "../../../models/model.js";
import Request from "../../../models/request.js";

class TestProvider {
  /** @type {object} */
  _il;

  /**
   * @param {object} il
   */
  constructor(il) {
    this._il = il;
  }
  /**
   * @param {Request} httpRequest
   * @param {CancellationToken} cancellationToken
   * @returns {Promise<IDataSource>}
   */
  getRoutingDataAsync(httpRequest, cancellationToken) {
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
    result.cms.page_il = JSON.stringify(this._il);

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
        "Connections.inline.RoutingData": new TestProvider({
          $type: "rawtext",
          content: "<h1>hi from so simple app<h1>",
        }),
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
