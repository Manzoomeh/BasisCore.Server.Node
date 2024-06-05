import HostManager from "../../../hostManager.js";
import { HostManagerOptions } from "../../../models/model.js";

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
      CacheSettings: {
        requestMethods: "GET",
        responseHeaders: ["content-type"],
        isEnabled: true,
      },
      Settings: {
        "Connections.edge.RoutingData": {
          endpoint: "127.0.0.1:8000",
        },
        "Connections.sqlite.cacheConnection": {
          dbPath: "test.db",
          tableName: "cache_results",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
