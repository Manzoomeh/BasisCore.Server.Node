import HostService from "./hostService.js";
import WebServerException from "../models/Exceptions/WebServerException.js";
import { HostServiceOptions } from "../models/model.js";
import WSMessageType from "../Models/WSMessageType.js";
import WebSocket from "ws";
import SessionManager from "./sessionManager.js";

export default class TestChatService extends HostService {
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
  }
  init(sessionId, serverSocket) {
  }
  /** @param {WebSocket} socket */
  createSession(socket) {
    let sessionId = this.sessionManager.addSession(socket);
    const otherSessions = this.sessionManager.findOtherSessions(sessionId);
    otherSessions.map((session) => {
      session[1].send(
        JSON.stringify({
          messageType: WSMessageType.CONNECT,
          sessionId: sessionId,
          message: `user with sessionId of ${sessionId} connected`,
        })
      );
    });
    return sessionId;
  }
  sendMessage(sessionId, message) {
    const otherSessions = this.sessionManager.findOtherSessions(sessionId);
    otherSessions.map((session) => {
      session[1].send(
        JSON.stringify({
          sessionId,
          message,
          messageType: WSMessageType.MESSAGE,
        })
      );
    });
  }
  disconnect(sessionId) {
    const otherSessions = this.sessionManager.findOtherSessions(sessionId);
    otherSessions.map((session) => {
      session[1].send(
        JSON.stringify({
          sessionId,
          messageType: WSMessageType.DISCONNECT,
        })
      );
    });
  }
}
