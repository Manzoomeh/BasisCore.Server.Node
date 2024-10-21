import HostService from "./hostService.js";
import WebServerException from "../models/Exceptions/WebServerException.js";
import { HostServiceOptions } from "../models/model.js";
import WSMessageType from "../Models/WSMessageType.js";
import WebSocket from "ws";
import SessionManager from "./sessionManager.js";

export default class WebsocketService extends HostService {
  /** @type {SessionManager} */
  sessionManager;
  /** @type {boolean} */
  isInitialized;
  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   */
  constructor(name, options) {
    super(name, options);
    this.isInitialized = false;
    this.sessionManager = new SessionManager();
    if (!this._options.Settings["Connections.ws.wsmain"]) {
      throw new WebServerException(
        `Router connection not set in '${name}' websocket base host service!`
      );
    }
    this.socket = new WebSocket(
      this._options.Settings["Connections.ws.wsmain"].endpoint
    );
  }
  init(sessionId, serverSocket) {
    const clientSocket = this.sessionManager.findSession(String(sessionId));
    clientSocket.on("message", (data) => {
      let jsData = JSON.parse(data);
      if (typeof jsData != "string") {
        jsData.sessionId = sessionId;
        serverSocket.send(JSON.stringify(jsData));
      }
    });
  }
  /** @param {WebSocket} socket */
  createSession(socket) {
    let sessionId = this.sessionManager.addSession(socket);
    this.socket.send(
      JSON.stringify({
        messageType: WSMessageType.CONNECT,
      })
    );
    return sessionId;
  }
  sendMessage(sessionId, message) {
    this.socket.send(
      JSON.stringify({
        sessionId,
        message,
        messageType: WSMessageType.MESSAGE,
      })
    );
  }
  adHoc(sessionId, message) {
    this.socket.send(
      JSON.stringify({
        sessionId,
        message,
        messageType: WSMessageType.AD_HOC,
      })
    );
  }
  disconnect(sessionId) {
    this.socket.send(
      JSON.stringify({
        sessionId,
        messageType: WSMessageType.DISCONNECT,
      })
    );
  }
}
