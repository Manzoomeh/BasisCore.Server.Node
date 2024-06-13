import TransportStream from "winston-transport";
import amqp from "amqplib";
import RabbitMQTransportSettings from "./RabbitmqTransportSettings.js";
import { Logger, format } from "winston";
export default class RabbitMQTransport extends TransportStream {
  /** @param {RabbitMQTransportSettings} */
  constructor(opts) {
    super(opts);
    this.queue = opts.queue;
    this.url = opts.url;
    /** @type {amqp.Connection | null} */
    this.connection = null;
    /** @type {amqp.Channel | null}*/
    this.channel = null;
    this.logQueue = []; 
    this.connect();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queue, { durable: true });
      this.processLogQueue(); // Process any logs that were queued while connecting
    } catch (err) {
      this.emit("error", err);
    }
  }

  processLogQueue() {
    while (this.logQueue.length > 0) {
      const { info, callback } = this.logQueue.shift();
      this.log(info, callback);
    }
  }

  log(info, callback) {
    setImmediate(() => this.emit("logged", info));

    if (this.channel) {
      this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(info)), {
        persistent: true,
      });
      callback();
    } else {
      this.logQueue.push({ info, callback });
    }
  }

  close() {
    if (this.connection) {
      this.connection.close();
    }
  }
  /***
   * @param {Logger}  logger
   * @param {RabbitMQTransportSettings} rabbitSetting
   * @param {Object} extraData
   */
  static addLogger(logger, rabbitSetting) {
    logger.add({
      transport: new RabbitMQTransport(rabbitSetting),
      format: format.combine(
        format.timestamp(),
        format.json(),
      ),
    });
    return logger;
  }
}
