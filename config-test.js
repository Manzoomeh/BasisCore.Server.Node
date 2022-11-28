import HostManager from "./hostManager.js";

const host = {
  Lazy: true,
  EndPoints: {
    Main01: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "0.0.0.0:8080",
        },
      ],
      Active: true,
      Routing: "edgeService",
    },
    Main02: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "0.0.0.0:8081",
        },
      ],
      Active: true,
      Routing: "fileService",
    },
    Main03: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "0.0.0.0:8082",
          Certificate: {
            Type: "ssl",
            FilePath: "test-cert/server.cert",
            KeyPath: "test-cert/server.key",
            Http2: false,
          },
        },
      ],
      Active: true,
      Routing: "sqlService",
    },
    Main04: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "0.0.0.0:8083",
          Certificate: {
            Type: "ssl",
            FilePath: "test-cert/server.cert",
            KeyPath: "test-cert/server.key",
            Http2: true,
          },
        },
      ],
      Active: true,
      Routing: "sqlService",
    },
    Main06: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "0.0.0.0:8084",
          Certificate: {
            Type: "ssl",
            FilePath: "test-cert/server.cert",
            KeyPath: "test-cert/server.key",
            Http2: true,
          },
        },
      ],
      Active: true,
      Routing: {
        Async: true,
        Items: [
          {
            Url: "/edge",
            Service: "edgeService",
          },
          {
            Url: "/static",
            Service: "fileService",
          },
          {
            Url: "/sql",
            Service: "sqlService",
          },
          {
            Service: "sqlService",
          },
        ],
      },
    },
  },
  Services: {
    edgeService: {
      Type: "sql",
      Settings: {
        "Connections.edge-socket.RoutingData": "127.0.0.1:1026",
      },
    },
    sqlService: {
      Type: "sql",
      Settings: {
        "Connections.sql.RoutingData":
          "Driver={SQL Server Native Client 11.0};Server=localhost;Database=temp;Uid=sa;Pwd=1234;Trusted_Connection=True;TrustServerCertificate=True;",
      },
    },
    fileService: {
      Type: "file",
      Settings: {
        Directory: "D:/Programming/Falsafi/Node/WebServer/wwwroot",
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
