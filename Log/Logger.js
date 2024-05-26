import { createLogger, format, transports, Logger } from "winston";
import RabbitMQTransport from "./RabbitMQTransport";
import RabbitMQTransportSettings from "./RabbitmqTransportSettings";

export default class Logger {
  /**
   * @param {Object} extraData
   * @param {RabbitMQTransportSettings} rabbitSetting
   * @returns {winston.Logger}
   */
  static createContext(extraData, rabbitSetting) {
    let transports = [new transports.Console()];
    if (rabbitSetting) {
      transports.push(new RabbitMQTransport(rabbitSetting));
    }
    return createLogger({
      level: "info",
      format: format.combine(
        format.timestamp(),
        format.json(),
        format((info) => {
          return { ...info, ...extraData };
        })()
      ),
      transports: transports,
    });
  }
}
