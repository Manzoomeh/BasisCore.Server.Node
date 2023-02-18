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
      Active: false,
      Routing: "edgeService",
    },
    Main02: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "0.0.0.0:8081",
        },
      ],
      Active: false,
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
      Active: false,
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
      Active: false,
      Routing: "sqlService",
    },
    Main05: {
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
      Active: false,
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
    Main06: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "127.0.0.1:8085",
          // Certificate: {
          //   Type: "sni",
          //   Http2: true,
          //   Hosts: [
          //     {
          //       HostNames: ["localhost"],
          //       FilePath: "test-cert/server.cert",
          //       KeyPath: "test-cert/server.key",
          //     },
          //     {
          //       HostNames: ["s2.ir", "www.s2.ir", "www.s2.ir"],
          //       FilePath: "test-cert/server.cert",
          //       KeyPath: "test-cert/server.key",
          //     },
          //   ],
          // },
        },
      ],
      Active: true,
      Routing: "sqlService",
    },
    Main07: {
      Type: "http",
      Addresses: [
        {
          EndPoint: "127.0.0.1:8086",
          // Certificate: {
          //   Type: "ssl",
          //   FilePath: "test-cert/server.cert",
          //   KeyPath: "test-cert/server.key",
          //   Http2: true,
          // },
        },
      ],
      Active: true,
      Routing: "fileService1",
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
    fileService1: {
      Type: "file",
      Settings: {
        Directory: "D:/Programming/Falsafi/Node/wwwroot/testqam",
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
