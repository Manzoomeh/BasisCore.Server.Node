import http from "http";
import https from "https";
import  { WebSocketServer } from "ws";
import HostEndPoint from "./hostEndPoint.js";
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
    
    const wss = new WebSocketServer({ ip: this._ip, port :this._port });
   
    wss.on("connection", (clientSocket) => { 
      
      const sessionId = this._service.createSession(clientSocket);
      this._service.init(sessionId,clientSocket);
      clientSocket.on("message", (message) => {
        this._service.sendMessage(sessionId,message.toString())
      });
      clientSocket.on("close", () => {
        this._service.disconnect(sessionId)
      });
      clientSocket.on("error", (err) => {
        console.error("Client socket error:", err);
      });
    });
    return this.server;
  }
  listenAsync() {
    this._createServer();
  }
}
