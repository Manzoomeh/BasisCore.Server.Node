import HostService from "./hostService.js";
import { io as clientIO, Socket } from "socket.io-client";
import WebServerException from "../models/Exceptions/WebServerException.js";
import { HostServiceOptions } from "../models/model.js";
import WSMessageType from "../Models/WSMessageType.js";
import messages from "pako/lib/zlib/messages.js";

export default class WebsocketService extends HostService {
  /**
   * @param {string} name
   * @param {HostServiceOptions} options
   */
  constructor(name, options) {
    super(name, options);
    if (!this._options.Settings["Connections.ws.wsmain"]) {
      throw new WebServerException(
        `Router connection not set in '${name}' websocket base host service!`
      );
    }
    try {
      this.socket = clientIO(this.settings.wsConnectionUrl);
    } catch (error) {
      throw new WebServerException(`connection to websocket service failed`);
    }
  }

  createSession(socketId) {
    this.socket.emit("clientconnect", {
      socketId,
      messageType: WSMessageType.CONNECT,
    });
    return sessionId;
  }
  sendMessage(socketId, message) {
    this.socket.emit("message", {
      socketId,
      message,
      messageType: WSMessageType.MESSAGE,
    });
  }
  adHoc(socketId, message) {
    this.socket.emit("message", {
      socketId,
      message,
      messageType: WSMessageType.AD_HOC,
    });
  }
  disconnect(socketId) {
    this.socket.emit("message", {
      socketId,
      messageType: WSMessageType.DISCONNECT,
    });
  }
}