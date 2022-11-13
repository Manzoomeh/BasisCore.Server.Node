import fs from "fs";
import {
  SecureHttpHostEndPoint,
  NonSecureHttpHostEndPoint,
  H2HttpHostEndPoint,
} from "./endPoint/endPoints.js";
import { StaticFileProxyHostService } from "./Services/hostServices.js";

/**
 * @type {import("tls").SecureContextOptions}
 */
var options = {
  key: fs.readFileSync("test-cert/server.key"),
  cert: fs.readFileSync("test-cert/server.cert"),
  //pfx: fs.readFileSync("namayeshgah.ir.pfx"),
  //passphrase: "namayeshgah.ir",
};

const service = new StaticFileProxyHostService("demo", "/wwwroot");

const http = new NonSecureHttpHostEndPoint("0.0.0.0", 8080, service);
const https = new SecureHttpHostEndPoint("0.0.0.0", 8081, service, options);
const h2 = new H2HttpHostEndPoint("0.0.0.0", 8082, service, options);

http.listen();
https.listen();
h2.listen();
