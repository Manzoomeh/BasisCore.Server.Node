const fs = require("fs");

const {
  SecureHttpHostEndPoint,
  NonSecureHttpHostEndPoint,
  H2HttpHostEndPoint,
} = require("./endPoint/endPoint");

/**
 * @type {import("tls").SecureContextOptions}
 */
var options = {
  key: fs.readFileSync("test-cert/server.key"),
  cert: fs.readFileSync("test-cert/server.cert"),
  //pfx: fs.readFileSync("namayeshgah.ir.pfx"),
  //passphrase: "namayeshgah.ir",
};

const dispatcher = (x) => {
  console.log("hi");
  return x;
};

var http = new NonSecureHttpHostEndPoint("0.0.0.0", 8080, dispatcher);
var https = new SecureHttpHostEndPoint("0.0.0.0", 8081, dispatcher, options);
var h2 = new H2HttpHostEndPoint("0.0.0.0", 8082, dispatcher, options);

http.listen();
https.listen();
h2.listen();
