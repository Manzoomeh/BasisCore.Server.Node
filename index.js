import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./models/model.js";

/** @type {HostManagerOptions} */
const host = {
  Lazy: true,
  EndPoints: {
    Main01: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "0.0.0.0:443",
        },
        { EndPoint: "0.0.0.0:80" },
      ],
      Active: true,
      Routing: "mainService",
    },
  },
  Services: {
    mainService: {
      Type: "http",
      Settings: {
        LibPath : "F:\\AliBazregar\\BasisCore.Server.Node\\ExternalCommands",
        "Connections.edge.RoutingData": {
          endpoint: "127.0.0.1:2002",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
