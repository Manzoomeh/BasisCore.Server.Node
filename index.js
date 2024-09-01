import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./models/model.js";

/** @type {HostManagerOptions} */
const host = {
  Lazy: true,
  EndPoints: {
    Main01: {
      Type: "websocket",
      id: "chat",
      Addresses: [
        {
          EndPoint: "127.0.0.1:3000",
        },
        { EndPoint: "127.0.0.1:8080" },
      ],
      Active: true,
      Routing: "chat",
    },
  },
  Services: {
    chat: {
      Type: "websocket",
      Settings: {
        "Connections.ws.wsmain": {
          endpoint: "ws://localhost:8080/time",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listenAsync();