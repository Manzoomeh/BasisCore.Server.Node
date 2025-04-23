import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./models/model.js";

/** @type {HostManagerOptions} */
// const host = {
//   Lazy: true,
//   EndPoints: {
//     Main06: {
//       Type: "http",
//       Addresses: [
//         {
//           EndPoint: "185.44.36.186:443",
//           Certificate: {
//             Type: "sni",
//             Http2: true,
//             Hosts: [
//               {
//                 HostNames: ["watermark.ir", "www.watermark.ir"],
//                 PfxPath: "./cert/watermark.ir/watermark.ir.pfx",
//                 PfxPassword: "fingerfood.ir",
//               },
//               // {
//               //   HostNames: ["fingerfood.ir", "www.fingerfood.ir"],
//               //   PfxPath: "./cert/fingerfood.ir/fingerfood.ir.pfx",
//               //   PfxPassword: "fingerfood.ir",
//               // },
//               // {
//               //   HostNames: ["smartnoyan.com", "www.smartnoyan.com"],
//               //   PfxPath: "./cert/smartnoyan.com/smartnoyan.com.pfx",

//               //   PfxPassword: "smartnoyan.com",
//               // },
//               // {
//               //   HostNames: ["manzoomeh.ir", "www.manzoomeh.ir"],
//               //   PfxPath: "./cert/manzoomeh.ir/manzoomeh.ir.pfx",
//               //   PfxPassword: "manzoomeh.ir",
//               // },
//               // {
//               //   HostNames: ["ansonkitchen.com", "www.ansonkitchen.com"],
//               //   PfxPath: "./cert/ansonkitchen.com/ansonkitchen.com.pfx",
//               //   PfxPassword: "ansonkitchen.com",
//               // },
//               // {
//               //   HostNames: ["gpsibitumen.com", "www.gpsibitumen.com"],
//               //   PfxPath: "./cert/gpsibitumen.com/gpsibitumen.com.pfx",
//               //   PfxPassword: "gpsibitumen.com",
//               // },
//               // {
//               //   HostNames: ["freeform.ir", "www.freeform.ir"],
//               //   PfxPath: "./cert/freeform.ir/freeform.ir.pfx",
//               //   PfxPassword: "freeform.ir",
//               // },
//               // {
//               //   HostNames: ["avita.one", "www.avita.one"],
//               //   PfxPath: "./cert/avita.one/avita.one.pfx",
//               //   PfxPassword: "avita.one",
//               // },
//               // {
//               //   HostNames: ["vitashe.ir", "www.vitashe.ir"],
//               //   PfxPath: "./cert/vitashe.ir/vitashe.ir.pfx",
//               //   PfxPassword: "vitashe.ir",
//               // },
//               // {
//               //   HostNames: ["damounparvaz.ir", "www.damounparvaz.ir"],
//               //   PfxPath: "./cert/damounparvaz.ir/damounparvaz.ir.pfx",
//               //   PfxPassword: "damounparvaz.ir",
//               // },
//               // {
//               //   HostNames: ["node.basiscore.net"],
//               //   PfxPath: "./cert/basiscore.net/basiscore.net.pfx",
//               //   PfxPassword: "basiscore.net",
//               // },
//               // {
//               //   HostNames: ["edcogermany.com", "www.edcogermany.com"],
//               //   PfxPath: "./cert/edcogermany.com/edcogermany.com.pfx",
//               //   PfxPassword: "edcogermany.com"
//               // },
//               // {
//               //   HostNames: ["lanatarh.com", "www.lanatarh.com"],
//               //   PfxPath: "./cert/lanatarh.com/lanatarh.com.pfx",
//               //   PfxPassword: "A9XRjZta"
//               // },
//               // {
//               //   HostNames: ["vitashe.co", "www.vitashe.co"],
//               //   PfxPath: "./cert/vitashe.co/vitashe.co.pfx",
//               //   PfxPassword: "vitashe.co"
//               // }
//             ],
//           },
//           // Certificate: {
//           //   Type: "ssl",
//           //   PfxPath: "cert/fingerfood.ir/fingerfood.ir.pfx",
//           //   PfxPassword: "fingerfood.ir",
//           //   Http2: true,
//           // },
//         },
//         {
//           EndPoint: "185.44.36.186:80",
//         },
//       ],
//       Active: true,
//       Routing: {
//         Async: true,
//         Settings: {
//           LibPath: "C:\\webServers\\BasisCore.Server.Node\\ExternalCommands",
//         },
//         Items: [
//           {
//             Url: "damounparvaz.ir/schema/",
//             Service: "schema_web",
//           },
//           {
//             Url: "node.basiscore.net/schema/",
//             Service: "schema_web",
//           },
//           {
//             Url: "damounparvaz.ir/trustlogin/",
//             Service: "trustlogin_web",
//           },
//           {
//             Url: "node.basiscore.net/trustlogin/",
//             Service: "trustlogin_web",
//           },
//           {
//             Url: "damounparvaz.ir",
//             Service: "Basisfly_mda",
//           },
//           {
//             Url: "node.basiscore.net",
//             Service: "Basisfly_mda",
//           },
//           {
//             Url: "freeform.ir/schema/",
//             Service: "basispanelschema",
//           },
//           {
//             Url: "freeform.ir/project/",
//             Service: "freeformproject",
//           },
//           {
//             Url: "manzoomeh.ir/store/",
//             Service: "manzoomeh_store",
//           },
//           {
//             Url: "/schema/",
//             Service: "site_schema",
//           },
//           {
//             Url: "/cms/",
//             Service: "dbsource_v1",
//           },
//           {
//             Url: ".webisaz.ir/",
//             Service: "webisazService",
//           },
//           {
//             Url: "freeform.ir/",
//             Service: "webisazService",
//           },
//           {
//             Url: "fingerfood.ir/",
//             Service: "fingerfood",
//           },
//           {
//             Service: "mainService",
//           },
//         ],
//       },
//       // CacheSettings: {
//       //   requestMethods: "GET",
//       //   responseHeaders: ["content-type"],
//       //   isEnabled: true,
//       //   connectionType: "sqlite",
//       //   connectionSetting: {
//       //     dbPath: "cache\\fingerfood.db",
//       //     tableName: "cache_results",
//       //   },
//       // },
//     },
//   },
//   Services: {
//     fingerfood: {
//       Type: "http",
//       Settings: {
//         LibPath: "C:\\apps\\BasisCore.Server.Node\\ExternalCommands",
//         "Connections.edge.RoutingData": {
//           endpoint: "192.168.96.76:2056",
//         },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "SbCallProcedure-v3",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "IL-update",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "UploadPermission",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.sqlbasiscore": {
//           connectionString:
//             "Server=192.168.96.18;Database=exhibitor;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.media": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=media;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.userbehavior": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=userbehavior;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.cmsdb": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.customerupload": {
//           connectionString:
//             "Server=192.168.96.8;Database=customerupload;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.trust_login": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.trust_login8": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.accounting": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=accounting;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.hosting": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.edge.trust": {
//           endpoint: "192.168.96.76:2030",
//         },
//         "Connections.edge.email_marketing": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.trustservice": {
//           endpoint: "192.168.96.76:2014",
//         },
//         "Connections.edge.domainform": {
//           endpoint: "192.168.96.75:2045",
//         },
//         "Connections.edge.store": {
//           endpoint: "192.168.96.76:2055",
//         },
//         "Connections.edge.reference": {
//           endpoint: "192.168.96.76:2064",
//         },
//         "Connections.edge.panel_trustlogin": {
//           endpoint: "192.168.96.76:2030",
//         },
//         "Connections.edge.basiscore": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.socket.cmsDbService": {
//           endpoint: "192.168.96.56:50007",
//         },
//         "Connections.edge.exhibitor": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.py_basiscore": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.test_basiscore": {
//           endpoint: "192.168.96.76:2077",
//         },
//         "Connections.edge.eshop": {
//           endpoint: "192.168.96.73:1560",
//         },
//         "Connections.edge.py_hosting": {
//           endpoint: "192.168.96.76:2092",
//         },
//         "Connections.edge.trustloginapi": {
//           endpoint: "192.168.96.76:1035",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Connections.socket.mydbsource": {
//           endpoint: "127.0.0.1:9090",
//         },

//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     mainService: {
//       Type: "http",
//       Settings: {
//         LibPath: "C:\\apps\\BasisCore.Server.Node\\ExternalCommands",
//         "Connections.sql.RoutingData": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "cmsnew100",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "SbCallProcedure-v3",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "IL-update",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "UploadPermission",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.sqlbasiscore": {
//           connectionString:
//             "Server=192.168.96.18;Database=exhibitor;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.DBSourceProcedure": {
//           connectionString:
//             "Server=192.168.96.18;Database=domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "UploadPermission",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.media": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=media;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.userbehavior": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=userbehavior;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.cmsdb": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.customerupload": {
//           connectionString:
//             "Server=192.168.96.8;Database=customerupload;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.trust_login": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.trust_login8": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.accounting": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=accounting;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.hosting": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.exhibitor_ir": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=namayeshgah_ir;user Id=school;password=cms#6633!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.exhibitor_com": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=namayeshgah_ir;user Id=school;password=cms#6633!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         // "Connections.sql.powerdns": {
//         //   connectionString:
//         //     "Server=192.168.96.37;Database=powerdns;user Id=basiscore;password=Basiscore-321;trustServerCertificate=true",
//         //   procedure: "dbsourceprocedure",
//         //   requestTimeout: "10000000",
//         // },
//         "Connections.sql.hoopa": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=powerdns;user Id=hoopa;password=Salam1Salam2;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.namayeshgah": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=namayeshgah;user Id=namayeshgah;password=namasql#1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.fingerfood": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=fingerfood;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.trustlogin": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=TrustLogin;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.edge.trust": {
//           endpoint: "192.168.96.76:2014",
//         },
//         "Connections.edge.email_marketing": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.trustservice": {
//           endpoint: "192.168.96.76:2014",
//         },
//         "Connections.edge.domainform": {
//           endpoint: "192.168.96.75:2045",
//         },
//         "Connections.edge.store": {
//           endpoint: "192.168.96.76:2055",
//         },
//         "Connections.edge.reference": {
//           endpoint: "192.168.96.76:2064",
//         },
//         "Connections.edge.panel_trustlogin": {
//           endpoint: "192.168.96.76:2030",
//         },
//         "Connections.edge.py_hosting": {
//           endpoint:"192.168.96.76:2092"
//         },
//         "Connections.edge.basiscore": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.socket.cmsDbService": {
//           endpoint: "192.168.96.56:50007",
//         },
//         "Connections.socket.cmsDbService2": {
//           endpoint: "192.168.96.56:14676",
//         },
//         "Connections.socket.cmsDbService3": {
//           endpoint: "192.168.96.56:7070",
//         },
//         "Connections.edge.exhibitor": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.store": { endpoint: "192.168.96.75:2055" },
//         "Connections.edge.py_basiscore": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.test_basiscore": {
//           endpoint: "192.168.96.76:2077",
//         },
//         "Connections.edge.trustloginapi": {
//           endpoint: "192.168.96.170:2001",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Connections.socket.mydbsource": {
//           endpoint: "127.0.0.1:9090",
//         },
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     dbsource_v1: {
//       Type: "http",
//       ReadBodyTimeout: 3000000,
//       ProcessTimeout: 300000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\apps\\BasisCore.Server.Node\\ExternalCommands",
//         CallMaxDepth: 1,
//         "Connections.edge.RoutingData": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "SbCallProcedure-v3",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "IL-update",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "UploadPermission",
//           requestTimeout: "10000000",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     site_schema: {
//       Type: "http",
//       ReadBodyTimeout: 120000,
//       ProcessTimeout: 120000,
//       MaxBodySize: 1024000000,
//       MaxMultiPartSize: 1024000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\apps\\BasisCore.Server.Node\\ExternalCommands",
//         CallMaxDepth: 1,
//         "Connections.edge.RoutingData": {
//           endpoint: "192.168.96.75:2045",
//         },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "SbCallProcedure-v3",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "IL-update",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "UploadPermission",
//           requestTimeout: "10000000",
//         },
//         "Default.WS.Source": "cmsDbService",
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//       },
//     },
//     manzoomeh_store: {
//       Type: "http",
//       ReadBodyTimeout: 3000000,
//       ProcessTimeout: 300000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\apps\\BasisCore.Server.Node\\ExternalCommands",
//         CallMaxDepth: 1,
//         "Connections.edge.RoutingData": {
//           endpoint: "192.168.96.75:2055",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     manzoomeh_store2: {
//       Type: "http",
//       ReadBodyTimeout: 3000000,
//       ProcessTimeout: 300000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\apps\\BasisCore.Server.Node\\ExternalCommands",
//         CallMaxDepth: 1,
//         "Connections.edge.RoutingData": {
//           endpoint: "192.168.96.75:20551",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     webisazService: {
//       Type: "http",
//       ReadBodyTimeout: 3000000,
//       ProcessTimeout: 300000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\apps\\BasisCore.Server.Node\\ExternalCommands",
//         "Connections.edge.RoutingData": {
//           endpoint: "192.168.96.76:2056",
//         },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "SbCallProcedure-v3",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "IL-update",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "UploadPermission",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.sqlbasiscore": {
//           connectionString:
//             "Server=192.168.96.18;Database=exhibitor;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.media": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=media;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.userbehavior": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=userbehavior;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.cmsdb": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.customerupload": {
//           connectionString:
//             "Server=192.168.96.8;Database=customerupload;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.trust_login": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.trust_login8": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.accounting": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=accounting;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.hosting": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.edge.trust": {
//           endpoint: "192.168.96.76:2030",
//         },
//         "Connections.edge.email_marketing": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.trustservice": {
//           endpoint: "192.168.96.76:2014",
//         },
//         "Connections.edge.domainform": {
//           endpoint: "192.168.96.75:2045",
//         },
//         "Connections.edge.store": {
//           endpoint: "192.168.96.76:2055",
//         },
//         "Connections.edge.reference": {
//           endpoint: "192.168.96.76:2064",
//         },
//         "Connections.edge.panel_trustlogin": {
//           endpoint: "192.168.96.76:2030",
//         },
//         "Connections.edge.basiscore": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.socket.cmsDbService": {
//           endpoint: "192.168.96.56:50007",
//         },
//         "Connections.edge.exhibitor": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.py_basiscore": {
//           endpoint: "192.168.96.75:2071",
//         },
//         "Connections.edge.test_basiscore": {
//           endpoint: "192.168.96.76:2077",
//         },
//         "Connections.edge.eshop": {
//           endpoint: "192.168.96.73:1560",
//         },
//         "Connections.edge.py_hosting": {
//           endpoint: "192.168.96.76:2092",
//         },
//         "Connections.edge.trustloginapi": {
//           endpoint: "192.168.96.170:2001",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Connections.socket.mydbsource": {
//           endpoint: "127.0.0.1:9090",
//         },

//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     freeformproject: {
//       Type: "http",
//       ReadBodyTimeout: 3000000,
//       ProcessTimeout: 300000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\Services\\manzoomeh.ir\\Commands",
//         CallMaxDepth: 1,
//         "Connections.edge.RoutingData": { endpoint: "192.168.96.76:2063" },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "[SbCallProcedure-v3]",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "[IL-update]",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "uploadpermission",
//           requestTimeout: "10000000",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     basispanelschema: {
//       Type: "http",
//       ReadBodyTimeout: 3000000,
//       ProcessTimeout: 300000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\Services\\manzoomeh.ir\\Commands",
//         CallMaxDepth: 1,
//         "Connections.edge.RoutingData": {
//           endpoint: "192.168.96.75:2000",
//         },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "[SbCallProcedure-v3]",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "IL-update",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "UploadPermission",
//           requestTimeout: "10000000",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     Basisfly_mda: {
//       Type: "http",
//       ReadBodyTimeout: 3000000,
//       ProcessTimeout: 300000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Multipart: {
//         CookieName: "uploadcookie",
//         CookieSource: "QueryString",
//         DefaultConfigUrl: "https://basiscore.net/upload/defaultconfig",
//         PermissionUrl: "https://basiscore.net/upload/permissions",
//         ReportUrl: "https://basiscore.net/upload/report",
//       },
//       Settings: {
//         LibPath: "C:\\Services\\basisfly\\Commands",
//         CallMaxDepth: 3,
//         "Connections.sql.RoutingData": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "[cms_web]",
//         },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "[SbCallProcedure-v3]",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "[IL-update]",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "uploadpermission",
//         },
//         "Connections.sql.cmsdb": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.exhibitori8": {
//           connectionString:
//             "Server=192.168.96.18;Database=exhibitor;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.customerupload": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=customerupload;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.hosting": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.trust_login8": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.media": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=media;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.accounting": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=accounting;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.exhibitor": {
//           connectionString:
//             "Server=192.168.96.9,1433;Database=exhibitor;user Id=basiscore;password=cms#6633!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.edge.email_marketing": {
//           endpoint: "192.168.96.109:8888",
//         },
//         "Connections.edge.trustloginapi": {
//           endpoint: "192.168.96.170:2001",
//         },
//         "Connections.sql.exhibitor_ir": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database==namayeshgah_ir;user Id=basiscore;password=cms#6633!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.trust_login": {
//           connectionString:
//             "Server=192.168.96.9,1433;Database=ticketing;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//           requestTimeout: "10000000",
//         },
//         "Connections.sql.exhibitor_ir": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=namayeshgah_ir;User Id=school;Password=cms#6633!1;TrustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.exhibitor_com": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=namayeshgah_com;User Id=school;Password=cms#6633!1;TrustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.powerdns": {
//           connectionString:
//             "Server=192.168.96.37;Database=powerdns;User Id=basiscore;Password=Basiscore-321;TrustServerCertificate=true",
//           procedure: "dbsourceprocedure",
//         },
//         "Connections.sql.hoopa": {
//           connectionString:
//             "Server=192.168.96.10,1433;Database=hoopa;User Id=hoopa;Password=Salam1Salam2;TrustServerCertificate=true",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.media8": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=media;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true;Max Pool Size=20",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.userbehavior": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=userbehavior;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true;Max Pool Size=20",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.basiscoretest": {
//           connectionString:
//             "Server=192.168.96.9,1433;Database=exhibitor;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true;Max Pool Size=20",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.basiscore_test": {
//           connectionString:
//             "Server=192.168.96.18,1433;Database=exhibitor;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true;Max Pool Size=20",
//           procedure: "DBSourceProcedure",
//         },

//         "Connections.edge-socket.basiscore": {
//           Endpoint: "192.168.96.109:8888",
//           PoolSize: 256,
//         },
//         "Connections.sql.accounting9": {
//           connectionString:
//             "Server=192.168.96.9,1433;Database=accounting;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true;Max Pool Size=20",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.trust_login9": {
//           connectionString:
//             "Server=192.168.96.9,1433;Database=ticketing;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true;Max Pool Size=20",
//           procedure: "DBSourceProcedure",
//         },
//         "Connections.sql.trust_login8": {
//           connectionString:
//             "Server=192.168.96.8,1433;Database=ticketing;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true;Max Pool Size=20",
//           procedure: "DBSourceProcedure",
//         },
//         // "Connections.mongo.Monitoring":
//         //   "mongodb://Basisfly54DB:Lowin%403041%409%2354DB@172.30.18.54:27018,172.30.18.53:27018/?connectTimeoutMS=300000&replicaSet=rs0&authSource=admin/Monitoring",
//         // "Connections.mongo.tracking":
//         //   "mongodb://falsafi:95941@192.168.96.54:27017/tracking",
//         // "Connections.mongo.Agencies":
//         //   "mongodb://Basisfly54DB:Lowin%403041%409%2354DB@172.30.18.54:27018,172.30.18.53:27018/?connectTimeoutMS=300000&replicaSet=rs0&authSource=admin/Agencies232",
//         // "Connections.mongo.Monitoring-Linux":
//         //   "mongodb://Basisfly54DB:Lowin%403041%409%2354DB@172.30.18.54:27018,172.30.18.53:27018/?connectTimeoutMS=300000&replicaSet=rs0&authSource=admin/Monitoring",
//         // "Connections.mongo.Monitoring-Linux-readonly":
//         //   "mongodb://falsafi:95941@185.44.36.53:27017/Monitoring",
//         // "Connections.mongo.Monitoring-Linux-readonly55":
//         //   "mongodb://falsafi:95941@185.44.36.55:27017/Monitoring",
//         "Connections.edge.reference": { endpoint: "192.168.96.76:2064" },
//         "Connections.socket.cmsDbService": { endpoint: "192.168.96.56:50007" },
//         "Connections.socket.cmsDbService1": { endpoint: "192.168.96.56:50008" },
//         "Connections.socket.cmsDbService2": { endpoint: "192.168.96.56:2020" },
//         "Connections.socket.cmsDbService3": { endpoint: "192.168.96.56:7070" },
//         "Connections.socket.cmsDbService4": { endpoint: "192.168.96.56:5050" },
//         "Connections.socket.cmsDbService5": { endpoint: "185.44.36.51:8080" },
//         "Connections.socket.cmsdbservice6": { endpoint: "185.44.36.51:5050" },
//         "Connections.edge-socket.trustservice": {
//           endpoint: "192.168.96.76:2043",
//         },
//         "Default.WS.Source": "cmsDbService3",
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//       },
//     },
//     trustlogin_web: {
//       Type: "http",
//       ReadBodyTimeout: 30000,
//       ProcessTimeout: 30000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\Services\\basisfly\\Commands",
//         CallMaxDepth: 1,
//         "Connections.edge-socket.RoutingData": "192.168.96.76:2043",
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true",
//           procedure: "[SbCallProcedure-v3]",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true",
//           procedure: "[IL-update]",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true",
//           procedure: "uploadpermission",
//         },
//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Connections.socket.cmsDbService2": {
//           endpoint: +"192.168.96.56:50007",
//         },
//         "Default.WS.Source": "cmsDbService2",
//         "Connections.web.basiscoreapi": "http://185.44.36.122:8080",
//         "Connections.web.trust_loginapi": "http://185.44.36.122:8080",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//     schema_web: {
//       Type: "http",
//       ReadBodyTimeout: 30000,
//       ProcessTimeout: 30000,
//       MaxBodySize: 500000000,
//       MaxMultiPartSize: 500000000,
//       UploadCookieSource: "Cookie",
//       Settings: {
//         LibPath: "C:\\Services\\basisfly\\Commands",
//         CallMaxDepth: 1,
//         "Connections.edge.RoutingData": { endpoint: "192.168.96.75:2053" },
//         "Connections.sql.CallCommand": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true",
//           procedure: "[SbCallProcedure-v3]",
//         },
//         "Connections.sql.ILUpdate": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true",
//           procedure: "[IL-update]",
//         },
//         "Connections.sql.MultiPart": {
//           connectionString:
//             "Server=192.168.96.10;Database=Domains;User Id=basiscore;Password=BasisCore!1;TrustServerCertificate=true",
//           procedure: "uploadpermission",
//         },

//         "Default.MultiPart.CookieName": "uploadcookie",
//         "Default.MultiPart.UploadPath": "//192.168.96.2/b",
//         "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
//         "Connections.socket.cmsDbService2": "192.168.96.56:50007",
//         "Default.WS.Source": "cmsDbService2",
//         "Connections.web.basiscoreapi": "http://185.44.36.122:8080",
//         "Connections.web.trust_loginapi": "http://185.44.36.122:8080",
//         "Default.ViewCommand.GroupColumn": "prpid",
//         "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
//         "Default.ScriptEngine.PythonPath":
//           "C:\\Services\\Server user.basiscore.com 217\\Service\\PythonScriptEngine.py",
//       },
//     },
//   },
// };

const host = {
  "Lazy": true,
  "EndPoints": {
    "Main06": {
      "Type": "http",
      "Addresses": [
        {
          "EndPoint": "185.44.36.192:443",
          "Certificate": {
            "Type": "ssl",
            "PfxPath": "cert/watermark.ir/watermark.ir.pfx",
            "PfxPassword": "watermark.ir",
            "Http2": true
          }
        },
        {
          "EndPoint": "185.44.36.192:80"
        }
      ],
      "Active": true,
      "Routing": "mainService",
      "CacheSettings": {
        "requestMethods": "GET",
        "responseHeaders": [
          "content-type"
        ],
        "isEnabled": false,
        "connectionType": "sqlite",
        "connectionSetting": {
          "dbPath": "cache\\watermark.db",
          "tableName": "cache_results",
          "isFileBase" : true,
          "filesPath" : "C:\\cache"
        }
      }
    }
  },
  "Services": {
    "mainService": {
      "Type": "http",
      "Settings": {
        "LibPath": "C:\\webServers\\BasisCore.Server.Node\\ExternalCommands",
        "Connections.edge.RoutingData": {
          "endpoint": "192.168.96.76:2056"
        },
        "Connections.sql.CallCommand": {
          "connectionString": "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          "procedure": "SbCallProcedure-v3",
          "requestTimeout": "10000000"
        },
        "Connections.sql.ILUpdate": {
          "connectionString": "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
          "procedure": "IL-update",
          "requestTimeout": "10000000"
        },
        
        "Default.MultiPart.CookieName": "uploadcookie",
        "Default.MultiPart.UploadPath": "//192.168.96.2/b",
        "Default.MultiPart.ArchivePath": "//192.168.96.2/a",
        "Default.ViewCommand.GroupColumn": "prpid",
        "Default.PythonPath": "c:\\Python\\Python38-32\\python.exe",
        "Connections.socket.mydbsource": {
          "endpoint": "127.0.0.1:9090"
        }
      }
    }
  }
}
const service = HostManager.fromJson(host);
service.listenAsync();
