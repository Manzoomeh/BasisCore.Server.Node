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
      LogSettings : {
        url : "amqp://basiscore:Salam1Salam2@192.168.96.72:5672",
        queue : "webserver_logs"
      },
      Settings: {
        "Connections.edge.RoutingData": {
          endpoint: "127.0.0.1:8080",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
