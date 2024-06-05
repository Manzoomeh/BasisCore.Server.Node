import ConnectionInfo from "../Connection/ConnectionInfo.js";
import BaseCacheUtil from "./BaseCacheUtil.js";
import * as ampq from "amqplib/callback_api";
import RabbitMQSetting from "./RabbitMqSetting.js";
export default class RabbitMQCacheUtil extends BaseCacheUtil {
  /**@type {ConnectionInfo}*/
  connectionInfo;
  /**@type {RabbitMQSetting} */
  settings;
  /** @type {ampq.Channel} */
  channel;

  /**
   * @param {ConnectionInfo}
   * @param {RabbitMQSetting} settings
   */
  constractor(connectionInfo, settings) {
    super(connectionInfo,settings);
  }
  /**
   * @returns {Promise<void>}
   */
  connectAsync() {
    return new Promise((resolve, reject) => {
      ampq.connect(this.settings.address, function (error0, connection) {
        if (error0) {
          reject(error0);
        }
        connection.createChannel(function (error1, channel) {
          if (error1) {
            reject(error1);
          }
          this.channel = channel;
          resolve();
        });
      });
    });
  }
  /**
   * @param {string} queueName
   * @returns {Promise<void>}
   */
  createDeleteChannel(queueName) {
    channel.assertQueue(queueName, {
      durable: true,
    });
    this.channel.consume(queueName, async function (msg) {
      await this.connection.deleteAllCache();
    });
  }
}
