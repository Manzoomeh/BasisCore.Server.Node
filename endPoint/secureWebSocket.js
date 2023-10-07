import https from "https";
import WebSocketServer from "ws";
import HttpHostEndPoint from "./HttpHostEndPoint.js";

export default class SecureWebSocket extends HttpHostEndPoint {
  /** @type {HostService} */
  #service;

  /** @type {import("tls").SecureContextOptions} */
  #options;
  /**
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   * @param {import("tls").SecureContextOptions} options
   */
  constructor(ip, port, service, options) {
    super(ip, port);
    this.#options = options;
    this.#service = service;
  }

  _createServer() {
    const server = https.createServer(this.#options);
    const wsServer = new websocket.server({ httpServer: server });

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
