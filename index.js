import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./models/model.js";

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
      Routing: "mainservice",
      CacheSettings: {
        requestMethods: "GET",
        responseHeaders: ["content-type"],
        isEnabled: true,
        connectionType: "sqlite",
        connectionSetting: {
          dbPath: "./cache/",
          filesPath: "./cachefiles/",
          isFileBase: true,
          hostDetailsApiUrl: "http://127.0.0.1:3000",
        },
      },
    },
  },
  Services: {
    mainservice: {
      Type: "http",
      Settings: {
        LibPath: "./ExternalCommands",
        "Connections.edge.RoutingData": {
          endpoint: "127.0.0.1:8000",
        },
        "Default.MultiPart.CookieName": "uploadcookie",
        "Default.ViewCommand.GroupColumn": "prpid",
        "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
        "Connections.socket.mydbsource": {
          endpoint: "127.0.0.1:9090",
        },
        "Default.ScriptEngine.PythonPath": "./PythonScriptEngine.py",
      },
    },
  },
};
const service = HostManager.fromJson(host);
service.listenAsync();
