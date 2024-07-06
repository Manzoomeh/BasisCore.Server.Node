import HostManager from "../../hostManager.js";
import { HostManagerOptions } from "../../models/model.js";

/** @type {HostManagerOptions} */
const host = {
  Lazy: true,
  EndPoints: {
    Main06: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "127.0.0.1:8080",
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
        "Connections.sql.RoutingData": {
          connectionString:
            "Server=.;Database=Manzoomeh-node;User Id=sa;Password=1234;trustServerCertificate=true",
          procedure: "cms",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
