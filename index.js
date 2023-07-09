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
          EndPoint: "127.0.0.1:80",
        },
      ],
      Active: true,
      Routing: "edgeService",
    },
 /**   Main03: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "185.44.36.76:443",
          Certificate: {
            Type: "ssl",
            //FilePath: "test-cert/server.cert",
            //KeyPath: "test-cert/server.key",
            PfxPath:
              "D:/webServer/node/cdn/certificates/basiscore.net/basiscore.net.pfx",
            PfxPassword: "basiscore.net",
            Http2: true,
          },
        },
      ],
      Active: true,
      Routing: "edgeService",
    }, */
  },
  Services: {
    edgeService: {
      Type: "sql",
      Settings: {
        "Connections.edge-socket.RoutingData": "192.168.96.76:1046",
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
