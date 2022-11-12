const {
  SecureHttpHostEndPoint,
  NonSecureHttpHostEndPoint,
  H2HttpHostEndPoint,
} = require("./endPoint/endPoint");

var http = new NonSecureHttpHostEndPoint("0.0.0.0", 8080);
var https = new SecureHttpHostEndPoint("0.0.0.0", 8081);
var h2 = new H2HttpHostEndPoint("0.0.0.0", 8082);

http.listen();
https.listen();
h2.listen();

console.log("end");
