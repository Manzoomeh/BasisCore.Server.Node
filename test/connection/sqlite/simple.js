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
      Settings: {
        "Connections.sqlite.RoutingData": {
          dbPath: "test.db",
          procedure: "[dbo].[cms]",
          requestTimeout : 10000000
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
