let lastSessionId = 0;
export default class SessionManager {
  /** @type {Map<string,WebSocket>} */
  sessionMap;

  constructor() {
    this.sessionMap = new Map();
  }

  addSession(session) {
    let sessionId = lastSessionId + 1;
    this.sessionMap.set(sessionId.toString(), session);
    return sessionId;
  }
  deleteSession(sessionId) {
    return this.sessionMap.delete(sessionId);
  }
  findSession(sessionId) {
    return this.sessionMap.get(sessionId);
  }
}
