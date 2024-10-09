import { randomUUID } from "crypto";


export default class SessionManager {
  /** @type {Map<string,WebSocket>} */
  sessionMap;

  constructor() {
    this.sessionMap = new Map();
  }

  addSession(session) {
    let sessionId = randomUUID();
    this.sessionMap.set(sessionId, session);
    return sessionId;
  }
  deleteSession(sessionId) {
    return this.sessionMap.delete(sessionId);
  }
  findSession(sessionId) {
    return this.sessionMap.get(sessionId);
  }
  findOtherSessions(sessionId){
    return Array.from(this.sessionMap).filter(([key]) => key !== sessionId);
  }
}
