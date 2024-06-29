import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./models/model.js";

/** @type {HostManagerOptions} */
const host = {
  Lazy: true,
  EndPoints: {
    Main01: {
      Type: "http",
      id: "fingerfood",
      Addresses: [
        {
          EndPoint: "0.0.0.0:443",
        },
        { EndPoint: "0.0.0.0:80" },
      ],
      Active: true,
      Routing: "mainService",
      CacheSettings: {
        requestMethods: "GET",
        responseHeaders: ["content-type"],
        isEnabled: true,
        connectionType: "sqlite",
        connectionSetting: {
          dbPath: "test.db",
          tableName: "cache_results",
          isFileBase: true,
          filesPath: "C:\\webservercache",
        },
      },
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
service.listenAsync();
