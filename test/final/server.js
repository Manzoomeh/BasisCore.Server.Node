import HostManager from "../../hostManager.js";
import IRoutingRequest from "../../models/IRoutingRequest.js";
import { HostManagerOptions } from "../../models/model.js";
import ConnectionInfo from "../../models/Connection/ConnectionInfo.js";
import Request from "../../models/request.js";
import { il } from "./il.js";

/** @type {HostManagerOptions} */
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
      Routing: "mainService",
    },
  },
  Services: {
    mainService: {
      Type: "http",
      Settings: {
        "Connections.sql.RoutingData": {
          connectionString:
            "Server=172.20.20.200;Database=test;User Id=sa;Password=Salam1Salam2;trustServerCertificate=true",
          procedure: "[dbo].[cms02]",
        },
        "Connections.sql.CallCommand": {
          connectionString:
            "Server=172.20.20.200;Database=test1;User Id=sa;Password=Salam1Salam2;trustServerCertificate=true",
          procedure: "[dbo].[SbCallProcedure]",
        },
        "Connections.mongodb.findObjects": {
          endpoint: "mongodb://127.0.0.1:27017",
          dataBase: "mydatabase",
          collection: "Objects",
          method: "find",
          query: {},
        },
        "Connections.mysql.findProducts": {
          host: "127.0.0.1",
          user: "root",
          password: "09177283475",
          database: "test-ab",
          procedure: "getAllProducts",
        },
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listen();
