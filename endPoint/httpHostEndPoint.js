import http from "http";
import dayjs from "dayjs";
import url from "url";
import HostEndPoint from "./hostEndPoint.js";
import Request from "../models/request.js";
import StreamerEngine from "../fileStreamer/StreamerEngine.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";

let requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /** @type {StreamerEngine} */
  _engine;

  /**
   *
   * @param {string} ip
   * @param {number} port
   */
  constructor(ip, port) {
    super(ip, port);
    /** @type {IStreamerEngineOptions} */
    const options = {
      DefaultConfigUrl: "StreamerEngine.global-options.json",
      PermissionUrl: "StreamerEngine.local-options.json",
      ReportUrl: "StreamerEngine.report.json",
    };
    this._engine = new StreamerEngine(options);
  }

  /** @returns {Server}*/
  _createServer() {
    throw Error("_createServer not implemented in this type of end point!");
  }

  listen() {
    const server = this._createServer();
    server
      .on("error", (x) => console.error(x))
      .listen(this._port, this._ip, () =>
        console.log(`start listening over ${this._ip}:${this._port}`)
      );
  }

  /**
   * @param {string} urlStr
   * @param {string} method
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @param {NodeJS.Dict<string>} formFields
   * @param {BinaryContent[]} fileContents
   * @param {Socket} socket
   * @returns {Promise<Request>}
   */
  async _createCmsObjectAsync(
    urlStr,
    method,
    headers,
    formFields,
    fileContents,
    socket
  ) {
    const rawUrl = urlStr.substring(1);
    const urlPart = rawUrl.split("?");
    const queryString = urlPart.length >= 2 ? urlPart[1] : null;
    const urlObject = url.parse(rawUrl, true);
    headers["request-id"] = (++requestId).toString();
    headers["methode"] = method.toLowerCase();
    headers["rawurl"] = rawUrl;
    headers["url"] = urlObject.pathname ?? "";
    headers["full-url"] = `${headers["host"]}${urlStr}`;
    headers["hostip"] = socket.localAddress;
    headers["hostport"] = socket.localPort.toString();
    headers["clientip"] = socket.remoteAddress;
    if (urlObject.query) {
      const query = {};
      let hasQuery = false;
      for (const key in urlObject.query) {
        query[key] = urlObject.query[key];
        hasQuery = true;
      }
      if (hasQuery) {
        headers["query"] = query;
      }
    }
    headers["Form"] = formFields;
    const now = dayjs();
    const request = new Request();
    request.request = headers;
    request.cms = {
      date: now.format("MM/DD/YYYY"),
      time: now.format("HH:mm A"),
      date2: now.format("YYYYMMDD"),
      time2: now.format("HHmmss"),
      date3: now.format("YYYY.MM.DD"),
    };

    if (fileContents?.length > 0) {
      if (this._engine) {
        console.log(
          "income:",
          fileContents.map((x) => x.toString()).join("\n")
        );
        const report = await this._engine.processAsync(
          fileContents,
          queryString
        );
        request.cms["upload_log"] = report;
      } else {
        console.error("stream engine not config for file handling");
      }
    }
    return request;
  }
}

export default HttpHostEndPoint;
