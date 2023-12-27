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
        "Connections.mysql.RoutingData": {
          host: "127.0.0.1",
          user: "root",
          password: "09177283475",
          database : "test-ab",
          procedure: "cms",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
