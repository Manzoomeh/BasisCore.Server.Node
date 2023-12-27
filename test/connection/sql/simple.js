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
        "Connections.sql.RoutingData": {
          connectionString:
            "Server=.;Database=test ;User Id=sa;Password=434434;trustServerCertificate=true",
          procedure: "[dbo].[cms]",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
