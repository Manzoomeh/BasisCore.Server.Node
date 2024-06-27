import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./models/model.js";

/** @type {HostManagerOptions} */
const host = {
  Lazy: true,
  EndPoints: {
    Main06: {
      Type: "http",
      id: "fingerfood",
      Addresses: [
        {
          id: "1",
          EndPoint: "185.44.36.186:443",
          Certificate: {
            Type: "ssl",
            PfxPath: "test-cert/basiscore.net.pfx",
            PfxPassword: "basiscore.net",
            Http2: true,
          },
        },
        {
          id: "2",
          EndPoint: "185.44.36.186:80",
        },
      ],
      Active: true,
      Routing: "mainService",
      CacheSettings: {
        requestMethods: "GET",
        responseHeaders: ["content-type"],
        isEnabled: true,
        connectionType: "sqlite",
        connectionSetting: {
          dbPath: "test.db",
          tableName: "cache_results",
          isFileBase: true,
          filesPath: "C:\\webservercache",
        },
      },
    },
  },
  Services: {
    mainService: {
      Type: "http",
      Settings: {
        LibPath:
          "C:\\Users\\bazrgar\\Desktop\\finger\\BasisCore.Server.Node\\ExternalCommands",
        "Connections.edge.RoutingData": {
          endpoint: "192.168.96.76:2056",
        },
        "Connections.sql.CallCommand": {
          connectionString:
            "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "SbCallProcedure-v3",
          requestTimeout: "10000000",
        },
        "Connections.sql.ILUpdate": {
          connectionString:
            "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "IL-update",
          requestTimeout: "10000000",
        },
        "Connections.sql.MultiPart": {
          connectionString:
            "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "UploadPermission",
          requestTimeout: "10000000",
        },
        "Connections.sql.sqlbasiscore": {
          connectionString:
            "Server=192.168.96.18;Database=exhibitor;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "DBSourceProcedure",
          requestTimeout: "10000000",
        },
        //ask about copydb
        "Connections.sql.DBSourceProcedure": {
          connectionString:
            "Server=192.168.96.18;Database=domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "UploadPermission",
          requestTimeout: "10000000",
        },
        "Connections.sql.media": {
          connectionString:
            "Server=192.168.96.8,1433;Database=media;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "DBSourceProcedure",
          requestTimeout: "10000000",
        },
        "Connections.sql.userbehavior": {
          connectionString:
            "Server=192.168.96.8,1433;Database=userbehavior;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "DBSourceProcedure",
          requestTimeout: "10000000",
        },
        "Connections.sql.cmsdb": {
          connectionString:
            "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "DBSourceProcedure",
          requestTimeout: "10000000",
        },
        "Connections.sql.trust_login": {
          connectionString:
            "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "DBSourceProcedure",
          requestTimeout: "10000000",
        },
        "Connections.sql.accounting": {
          connectionString:
            "Server=192.168.96.8,1433;Database=accounting;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "DBSourceProcedure",
          requestTimeout: "10000000",
        },
        "Connections.sql.hosting": {
          connectionString:
            "Server=192.168.96.10,1433;Database=domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          procedure: "DBSourceProcedure",
          requestTimeout: "10000000",
        },
        "Connections.edge.trust": {
          endpoint: "192.168.96.76:2030",
        },
        "Connections.edge.trustservice": { endpoint: "192.168.96.76:2014" },
        "Connections.edge.store": { endpoint: "192.168.96.76:2055" },
        "Connections.edge.reference": { endpoint: "192.168.96.76:2064" },
        "Connections.edge.panel_trustlogin": { endpoint: "192.168.96.76:2030" },
        "Connections.edge.basiscore": {
          endpoint: "192.168.96.75:2071",
        },
        "Connections.socket.cmsDbService": { endpoint: "192.168.96.56:50007" },
        "Connections.edge.exhibitor": { endpoint: "192.168.96.75:2071" },
        "Connections.edge.py_basiscore": { endpoint: "192.168.96.75:2071" },
        "Connections.edge.test_basiscore": { endpoint: "192.168.96.76:2077" },
        "Connections.edge.trustloginapi": { endpoint: "192.168.96.76:1035" },
        "Default.MultiPart.CookieName": "uploadcookie",
        "Default.MultiPart.UploadPath": "//192.168.96.2/b",
        "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
        "Default.ViewCommand.GroupColumn": "prpid",
        "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
        "Connections.socket.mydbsource": { endpoint: "127.0.0.1:9090" },
        "Default.ScriptEngine.PythonPath":
          "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
      },
    },
  },
};

const service = HostManager.fromJson(host);
service.listenAsync();
