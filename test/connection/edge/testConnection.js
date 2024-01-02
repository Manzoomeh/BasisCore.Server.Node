import EdgeConnectionInfo from "./../../../Models/Connection/EdgeConnectionInfo.js";
const Edge = new EdgeConnectionInfo("test", {
  endpoint: "127.0.0.1:1025",
});
console.log(await Edge.testConnectionAsync());
