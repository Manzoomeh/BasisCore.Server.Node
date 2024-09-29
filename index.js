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
          EndPoint: "127.0.0.1:2020",
        },
        { EndPoint: "127.0.0.1:1010" },
      ],
      Active: true,
      Routing: "chat",
    },
  },
  Services: {
    chat: {
      Type: "testchat"
    },
  },
};

const service = HostManager.fromJson(host);
service.listenAsync();