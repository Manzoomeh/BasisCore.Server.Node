import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./models/model.js";

const host = {
  Lazy: true,
  EndPoints: {
    Main06: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "185.44.38.83:443",
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
          filesPath : "./cachefiles/",
          isFileBase : true
        },
      },
    },
  },
  Services: {
    mainservice: {
      Type: "http",
      Settings: {
        LibPath: "C:\\Users\\senka\\OneDrive\\Desktop\\projects\\BasisCore.Server.Node\\ExternalCommands",
        "Connections.edge.RoutingData": {
          endpoint: "127.0.0.1:8000",
        },
        "Default.MultiPart.CookieName": "uploadcookie",
        "Default.ViewCommand.GroupColumn": "prpid",
        "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
        "Connections.socket.mydbsource": {
          endpoint: "127.0.0.1:9090",
        },
        "Default.ScriptEngine.PythonPath":
          "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
      },
    },
  },
};
const service = HostManager.fromJson(host);
service.listenAsync();