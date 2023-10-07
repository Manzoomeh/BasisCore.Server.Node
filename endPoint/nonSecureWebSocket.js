import http from "http";
import websocket from "websocket";
import HttpHostEndPoint from "./HttpHostEndPoint.js";

export default class NonSecureWebSocket extends HttpHostEndPoint {
  /** @type {HostService} */
  #service;

  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   */
  constructor(ip, port, service) {
    super(ip, port);
    this.#service = service;
  }

  _createServer() {
    const server = http.createServer();
    const wsServer = new websocket.server({ httpServer: server });
    var msg;

    function originIsAllowed(origin) {
      // put logic here to detect whether the specified origin is allowed.
      return true;
    }

    wsServer.on("request", function (request) {
      if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log(
          new Date() +
            " Connection from origin " +
            request.origin +
            " rejected."
        );
        return;
      }

      var connection = request.accept(null, request.origin);
      console.log(new Date() + " Connection accepted.");
      connection.on("message", function (message) {
        if (message.type === "utf8") {
          console.log("Received Message: " + message.utf8Data);
          connection.sendUTF(message.utf8Data);
        } else if (message.type === "binary") {
          console.log(
            "Received Binary Message of " + message.binaryData.length + " bytes"
          );
          connection.sendBytes(message.binaryData);
        }
      });
      connection.on("close", function (reasonCode, description) {
        console.log(
          new Date() + " Peer " + connection.remoteAddress + " disconnected."
        );
      });
    });
    return server;
  }
}
