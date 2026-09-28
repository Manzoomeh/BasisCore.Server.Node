import net from "net";
import { randomUUID } from "crypto";
import MessageTypes from "./messageTypes.js";

export default class EdgeMessage {
  /** @type {MessageTypes}*/
  #messageType;
  /** @type {string}*/
  #sessionId;
  /** @type {Buffer}*/
  #payload;

  /**
   * @param {MessageTypes} messageType
   * @param {string} sessionId
   * @param {Buffer} payload
   */
  constructor(messageType, sessionId, payload) {
    this.#messageType = messageType;
    this.#sessionId = sessionId;
    this.#payload = payload;
  }

  get payload() {
    return this.#payload;
  }

  /**
   * @param {net.Socket} socket
   */
  writeTo(socket) {
    socket.write(Buffer.from([this.#messageType]));
    const guidBuffer = Buffer.from(this.#sessionId);
    const guidLenBuffer = EdgeMessage.#getInt32Bytes(guidBuffer.length);
    socket.write(guidLenBuffer);
    socket.write(guidBuffer);
    socket.write(EdgeMessage.#getInt32Bytes(this.#payload.length));
    socket.write(this.#payload);
  }

  /**
   * @param {number} x
   * @returns {Buffer}
   */
  static #getInt32Bytes(x) {
    const bytes = Buffer.alloc(4);
    bytes.writeInt32BE(x);
    return bytes;
  }

  /**
   * @returns {string}
   */
  static getNewGUID() {
    return randomUUID();
  }

  /**
   * @param {Buffer} buffer
   * @returns {EdgeMessage}
   */
  static createFromBuffer(buffer) {
    if (!Buffer.isBuffer(buffer) || buffer.length < 9) {
      throw new RangeError(
        `Invalid edge message buffer length: ${buffer?.length ?? 0}`
      );
    }
    if (buffer.subarray(0, 5).toString("ascii") === "HTTP/") {
      const statusLine = buffer.toString("ascii").split("\r\n", 1)[0];
      throw new Error(
        `Edge endpoint returned HTTP instead of Edge protocol: ${statusLine}`
      );
    }

    const msgType = buffer.readInt8(0);
    const idLen = buffer.readInt32BE(1);
    if (idLen < 0) {
      throw new RangeError(`Invalid edge session id length: ${idLen}`);
    }

    const sessionStart = 5;
    const sessionEnd = sessionStart + idLen;
    if (sessionEnd + 4 > buffer.length) {
      throw new RangeError(
        `Invalid edge session id length ${idLen} for ${buffer.length}-byte buffer.`
      );
    }

    const payloadLen = buffer.readInt32BE(sessionEnd);
    if (payloadLen < 0) {
      throw new RangeError(`Invalid edge payload length: ${payloadLen}`);
    }
    const payloadStart = sessionEnd + 4;
    const payloadEnd = payloadStart + payloadLen;
    if (payloadEnd > buffer.length) {
      throw new RangeError(
        `Invalid edge payload length ${payloadLen}; only ${
          buffer.length - payloadStart
        } bytes are available.`
      );
    }

    const sessionId = buffer.toString("utf-8", sessionStart, sessionEnd);
    const payload = buffer.toString("utf-8", payloadStart, payloadEnd);

    return new EdgeMessage(msgType, sessionId, payload);
  }

  /**
   * @param {object} obj
   * @returns {EdgeMessage}
   */
  static createAdHocMessageFromObject(obj) {
    return EdgeMessage.createAdHocMessageFromJson(JSON.stringify(obj));
  }

  /**
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
