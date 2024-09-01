import http from "http";
import https from "https";
import ws from "ws";
import HostEndPoint from "./hostEndPoint.js";
import MessageType from "../Models/WSMessageType.js";
import WebsocketService from "../Services/WebsocketService.js";
import WebServerException from "../models/Exceptions/WebServerException.js";

let sessionId = 0;

export default class WebsocketEndPoint extends HostEndPoint {
  /** @type {import("tls").SecureContextOptions} */
  #options;
  /** @type {WebsocketService} */
  _service;
  /**
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   * @param {import("tls").SecureContextOptions} options
   * @param {string} targetServer
   */
  constructor(ip, port, service, options) {
    super(ip, port);
    this.#options = options;
    if (!(service instanceof WebsocketService)) {
      throw new WebServerException(
        "The service for Web Socket endpoint must be Websocket Service only."
      );
    }
    this._service = service;
  }

  _createServer() {
    if (this.#options && Object.keys(this.#options).length > 0) {
      this.server = https.createServer(this.#options);
    } else {
      this.server = http.createServer();
    }
    server.on("request", (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.end();
    });

    const wss = new WebSocket.Server({ server: server });
    this._service.socket.on("message", (data) => {
      const recievedData = JSON.parse(data);
      io.to(recievedData.socketId).emit("message", data);
    });

    io.on("connection", (socket) => {
      console.log("A user connected");
      this._service.createSession(socket.id);
      socket.on("message", (data) => {
        this._service.sendMessage(sessionId, data);
      });
      //ask about other event handlers
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        this._service.disconnect(sessionId);
      });
    });
    console.log("33");
    return this.server;
  }
  listenAsync() {
    this._createServer();
    this.server.listen(this._port, this._ip, () => {
      console.log(`websocket listening on ws://${this._ip}:${this._port}`);
    });
  }
}
