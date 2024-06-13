import { createLogger, format, transports } from "winston";
import RabbitMQTransport from "./RabbitMQTransport.js";

export default class LoggerUtil {
  /**
   * @param {Object} extraData

   * @returns {winston.Logger}
   */
  static createContext(rabbitSetting) {
    let logger = createLogger({
      level: "info",
      format: format.combine(
        format.timestamp(),
        format.toString(),
        format.colorize()
      ),
      transports: [new transports.Console()],
    });
    return rabbitSetting
      ? RabbitMQTransport.addLogger(logger, rabbitSetting)
      : logger;
  }
}
