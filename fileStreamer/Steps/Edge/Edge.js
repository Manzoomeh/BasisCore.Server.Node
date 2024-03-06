import net from "net";
import url from "url";
import BinaryContent from "../../Models/BinaryContent.js";
import Status from "../../Models/Status.js";
import Step from "../Step.js";
import EdgeOptions from "./EdgeOptions.js";
import EdgeMessage from "../../../edge/edgeMessage.js";
import Request from "../../../models/request.js";
import EdgeResult from "./EdgeResult.js";

export default class Edge extends Step {
  /**
   * @param {BinaryContent} content
   * @param {EdgeOptions} options
   * @returns {Promise<BinaryContent>}
   */
  async processContentAsync(content, options) {
    try {
      console.log(content.url);
      const parts = options.endpoint.split(":", 2);
      if (parts.length !== 2) {
        throw Error("Endpoint not config for edge step in file streamer");
      }
      const ip = parts[0];
      const port = parts[1];
      /** @type {Promise<Request>} */
      const task = new Promise((resolve, reject) => {
        const buffer = [];
        const client = new net.Socket()
          .on("data", (data) => buffer.push(data))
          .on("close", function () {
            const data = Buffer.concat(buffer);
            try {
              const msg = EdgeMessage.createFromBuffer(data);
              resolve(JSON.parse(msg.payload));
            } catch (e) {
              reject(e);
            }
          })
          .on("error", (e) => {
            console.error(e);
            reject(e);
          })
          .connect(port, ip, () => {
            const request = new Request();
            const urlObject = url.parse(content.url, true);
            request.request = {
              "request-id": 0,
              methode: "post",
              "full-url": content.url,
              url: urlObject.pathname.substring(1),
              rawurl: urlObject.pathname.substring(1),
            };
            request["form"] = {
              options: options.options,
              name: content.name,
              mime: content.mime,
              payload: content.payload.toString("base64"),
            };
            if (urlObject.query) {
              const query = {};
              let hasQuery = false;
              for (const key in urlObject.query) {
                query[key] = urlObject.query[key];
                hasQuery = true;
              }
              if (hasQuery) {
                request["query"] = query;
              }
            }
            request.cms = {};
            const msg = EdgeMessage.createAdHocMessageFromObject({
              cms: request,
            });
            msg.writeTo(client);
          });
      });
      const requestResult = await task;
      content.AddLog("edge", options.endpoint);
      /** @type {EdgeResult} */
      const result = JSON.parse(requestResult.cms.content);
      content.name = result.name;
      content.mime = result.mime;
      content.payload = Buffer.from(result.payload, "base64");
      result.logs.forEach((log) => {
        content.AddLog(log.title, log.message);
      });
    } catch (er) {
      console.error(er);
      content.AddLog("rest-error", er);
      content.status = Status.StepError;
    }
    return Promise.resolve(content);
  }
}
