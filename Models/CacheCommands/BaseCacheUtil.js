import ConnectionInfo from "../Connection/ConnectionInfo";
export default class BaseCacheUtil {
  /**@type {ConnectionInfo}*/
  connectionInfo;
  channel;

  /**@param {ConnectionInfo} */
  constractor(connectionInfo,settings) {
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
