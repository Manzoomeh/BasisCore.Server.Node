import ConnectionInfo from "../Connection/ConnectionInfo.js";
export default class BaseCacheUtil {
  /**@type {ConnectionInfo}*/
  connectionInfo;
  channel;

  /**@param {ConnectionInfo} */
  constructor(connectionInfo,settings) {
    this.connectionInfo = connectionInfo;
    this.settings = settings
  }

  /**
   * @returns {Promise<void>}
   */
  connectAsync() {}

  /**@returns {Promise<void>} */
  createDeleteChannel() {}
}
