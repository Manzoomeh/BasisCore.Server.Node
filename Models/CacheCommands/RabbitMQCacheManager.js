import BaseCacheManager from "./BaseCacheManager.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const amqp = require("amqplib/callback_api");
import RabbitMQSetting from "./RabbitMqSetting.js";
import CacheConnectionBase from "./CacheConnection/CacheConnectionBase.js";

export default class RabbitMQCacheManager extends BaseCacheManager {
  /**@type {CacheConnectionBase}*/
  connection;
  /**@type {RabbitMQSetting} */
  settings;
  /** @type {amqp.Channel} */
  channel;

  /**
   * @param {CacheConnectionBase} connectionInfo
   * @param {RabbitMQSetting} settings
   */
  constructor(connectionInfo, settings) {
    super(connectionInfo, settings);
  }
  /**
   * @returns {Promise<void>}
   */
  async initializeAsync(queueName) {
    await new Promise((resolve, reject) => {
      amqp.connect(this.settings.address, function (error0, connection) {
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
    await this.createDeleteChannel(this.settings.queueName);
  }
  /**
   * @param {string} queueName
   * @returns {Promise<void>}
   */
  createDeleteChannel(queueName) {
    this.channel.assertQueue(queueName, {
      durable: true,
    });
    this.channel.consume(queueName, async function (msg) {
      await this.connection.deleteAllCache();
    });
  }
  /**
 * @param {string} queueName
 * @returns {Promise<void>}
 */
  createUpdateExpiration(queueName) {
    this.channel.assertQueue(queueName, {
      durable: true,
    });
    this.channel.consume(queueName, async function (msg) {
      const { ownerId, newExpireDateString } = JSON.parse(msg.content.toString())
      await this.connection.extendOwnerDomainsExpireDate(ownerId, newExpireDateString)
    });
  }
  /**
 * @param {string} queueName
 * @returns {Promise<void>}
 */
  createUpdateAssetExpiration(queueName) {
    this.channel.assertQueue(queueName, {
      durable: true,
    });
    this.channel.consume(queueName, async function (msg) {
      const { key, newExpireDateString } = JSON.parse(msg.content.toString())
      await this.connection.changeAssetCacheExpire(key, newExpireDateString)
    });
  }
  /**
 * @param {string} queueName
 * @returns {Promise<void>}
 */
  createUpdateAssetExpiration(queueName) {
    this.channel.assertQueue(queueName, {
      durable: true,
    });
    this.channel.consume(queueName, async function (msg) {
      const { dmnid, newExpireDateString } = JSON.parse(msg.content.toString())
      await this.connection.changeHostCacheExpire(dmnid, newExpireDateString)
    });
  }
}
