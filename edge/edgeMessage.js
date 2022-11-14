const net = require("net");
const { randomUUID } = require("crypto");
import MessageTypes from "./messageTypes.js";

class EdgeMessage {
  /**
   *
   * @param {MessageTypes} messageType
   * @param {string} sessionId
   * @param {Buffer} payload
   */
  constructor(messageType, sessionId, payload) {
    this._messageType = messageType;
    this._sessionId = sessionId;
    this._payload = payload;
  }

  get payload() {
    return this._payload;
  }

  /**
   *
   * @param {net.Socket} socket
   */
  writeTo(socket) {
    socket.write(Buffer.from([this._messageType]));
    const guidBuffer = Buffer.from(this._sessionId);
    const guidLenBuffer = EdgeMessage._getInt32Bytes(guidBuffer.length);
    socket.write(guidLenBuffer);
    socket.write(guidBuffer);
    socket.write(EdgeMessage._getInt32Bytes(this._payload.length));
    socket.write(this._payload);
  }

  /**
   *
   * @param {number} x
   * @returns {Buffer}
   */
  static _getInt32Bytes(x) {
    const bytes = Buffer.alloc(4);
    bytes.writeInt32BE(x);
    return bytes;
  }

  /**
   *
   * @returns {string}
   */
  static getNewGUID() {
    return randomUUID();
  }

  /**
   *
   * @param {Buffer} buffer
   * @returns {EdgeMessage}
   */
  static createFromBuffer(buffer) {
    const msgType = buffer.readInt8();
    const idLen = buffer.readInt32BE(1);
    const sessionId = buffer.toString("utf-8", 5, idLen);
    const payloadLen = buffer.readInt32BE(5 + idLen);
    const payload = buffer.toString("utf-8", 5 + idLen + 4);

    return new EdgeMessage(msgType, sessionId, payload);
  }

  /**
   *
   * @param {object} obj
   * @returns {EdgeMessage}
   */
  static createAdHocMessageFromObject(obj) {
    return EdgeMessage.createAdHocMessageFromJson(JSON.stringify(obj));
  }

  /**
   *
   * @param {string} json
   * @returns {EdgeMessage}
   */
  static createAdHocMessageFromJson(json) {
    return new EdgeMessage(
      MessageTypes.AdHoc,
      EdgeMessage.getNewGUID(),
      Buffer.from(json)
    );
  }
}

module.exports = EdgeMessage;
