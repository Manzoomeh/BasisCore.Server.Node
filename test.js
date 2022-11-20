import fs from "fs";
import {
  SecureHttpHostEndPoint,
  NonSecureHttpHostEndPoint,
  H2HttpHostEndPoint,
} from "./endPoint/endPoints.js";
import {
  EdgeProxyHostService,
  StaticFileProxyHostService,
  SqlProxyHostService,
  RouterHostService,
  RouterOptions,
} from "./services/hostServices.js";

/**
 * @type {import("tls").SecureContextOptions}
 */
var options = {
  key: fs.readFileSync("test-cert/server.key"),
  cert: fs.readFileSync("test-cert/server.cert"),
  //pfx: fs.readFileSync("namayeshgah.ir.pfx"),
  //passphrase: "namayeshgah.ir",
};

const fileService = new StaticFileProxyHostService(
  "demo",
  "D:/Programming/Falsafi/Node/WebServer/wwwroot"
);

const edgeService = new EdgeProxyHostService("edge", "127.0.0.1", 1026);

const sqlService = new SqlProxyHostService(
  "sql",
  "Driver={SQL Server Native Client 11.0};Server=localhost;Database=temp;Uid=sa;Pwd=1234;Trusted_Connection=True;TrustServerCertificate=True;"
);

var routerOptions = [
  new RouterOptions(edgeService, "/edge"),
  new RouterOptions(fileService, "/static"),
  new RouterOptions(sqlService, "/sql|.*"),
];
const router = new RouterHostService("router", routerOptions);

const service = fileService;
const http = new NonSecureHttpHostEndPoint("0.0.0.0", 8080, router);
const https = new SecureHttpHostEndPoint("0.0.0.0", 8081, router, options);
const h2 = new H2HttpHostEndPoint("0.0.0.0", 8082, router, options);

http.listen();
https.listen();
h2.listen();
