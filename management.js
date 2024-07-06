import HostManager from "./hostManager.js";

HostManager.startManagementServer(
  "./config.json",
  {
   Type: "http",
    Settings: {
      LibPath:
        "C:\\Users\\bazrgar\\Desktop\\finger\\BasisCore.Server.Node\\ExternalCommands",
      "Connections.edge.RoutingData": {
        endpoint: "185.44.36.77:1025",
      },
    },
  },
  "185.44.36.77",
  2020,{
    LibPath : "C:\\Users\\bazrgar\\Desktop\\FINGERFOOD-MAIN\\BasisCore.Server.Node\\ExternalCommands"
  }
);
