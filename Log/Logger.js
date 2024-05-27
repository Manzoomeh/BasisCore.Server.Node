import { createLogger, format, transports } from "winston";
import RabbitMQTransport from "./RabbitMQTransport.js";
import RabbitMQTransportSettings from "./RabbitmqTransportSettings.js";

export default class Logger {
  /**
   * @param {Object} extraData
   * @param {RabbitMQTransportSettings} rabbitSetting
   * @returns {winston.Logger}
   */
  static createContext(extraData, rabbitSetting) {
    let transportsArray = [];
    if (rabbitSetting) {
      transportsArray.push(new RabbitMQTransport(rabbitSetting));
    }
    const customFormat = format((info) => {
      info.data = {
        schemaId: "8FCFD607-6A56-499B-98D5-E5A92502BBD5",
        paramUrl: "/E7E259BE-0434-40D9-8897-F45EF6940EF3/8FCFD607-6A56-499B-98D5-E5A92502BBD5/fa/log",
        schemaName: "log",
        schemaVersion: "1.0.0",
        lid: 1,
        baseVocab: "http://schema.site/FA/vo",
        properties: [
          {
            propId: 6292,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: extraData.url,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            propId: 6293,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: extraData.rawUrl,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            propId: 6294,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: extraData.domain,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            propId: 6295,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: extraData.pageid,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            propId: 6297,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: extraData.requestId,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            propId: 6298,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: extraData.errorType,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            propId: 6299,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: info.message,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            propId: 6300,
            multi: false,
            added: [
              {
                parts: [
                  {
                    part: 1,
                    values: [
                      {
                        value: info.level,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      return info;
    });

    return createLogger({
      level: "info",
      format: format.combine(
        format.timestamp(),
        format.json(),
        customFormat()
      ),
      transports: transportsArray,
    });
  }
}
