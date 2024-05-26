import TransportStream from "winston-transport";
import amqp from "amqplib";
import RabbitMQTransportSettings from "./RabbitmqTransportSettings";

export default class RabbitMQTransport extends TransportStream {
  /** @param {RabbitMQTransportSettings} */
  constructor(opts) {
    super(opts);
    this.exchange = opts.exchange;
    this.routingKey = opts.routingKey;
    this.url = opts.url;
    /** @type {amqp.Connection | null} */
    this.connection = null;
    /** @type {amqp.Channel | null}*/
    this.channel = null;
    amqp
      .connect(this.url)
      .then((conn) => {
        this.connection = conn;
        return conn.createChannel();
      })
      .then((ch) => {
        this.channel = ch;
        return ch.assertExchange(this.exchange, "topic", { durable: false });
      })
      .catch((err) => {
        this.emit("error", err);
      });
  }

  log(info, callback) {
    setImmediate(() => this.emit("logged", info));

    if (this.channel) {
      this.channel.publish(
        this.exchange,
        this.routingKey,
        Buffer.from(JSON.stringify(info))
      );
    }

    callback();
  }
}
