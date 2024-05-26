import http, { Server } from "http";
import { StatusCodes } from "http-status-codes";
import HttpHostEndPoint from "./HttpHostEndPoint.js";
import { HostService } from "../services/hostServices.js";
import Logger from "../Log/Logger.js";
import winston from "winston";
import Request from "../models/request.js";

export default class NonSecureHttpHostEndPoint extends HttpHostEndPoint {
  /** @type {HostService} */
  #service;
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {HostService} service
   */
  constructor(ip, port, service) {
    super(ip, port);
    this.#service = service;
  }

  _createServer() {
    this._server = http.createServer(async (req, res) => {
      try {
        /** @type {Request} */
        let cms = null;
        this._handleContentTypes(req, res, async () => {
          const createCmsAndCreateResponseAsync = async () => {
            cms = await this._createCmsObjectAsync(
              req.url,
              req.method,
              req.headers,
              req.formFields,
              req.jsonHeaders ? req.jsonHeaders : {},
              req.socket,
              req.bodyStr,
              false
            );
            let parameters = {
              url: cms.request["full-url"],
              rawUrl: req.url,
              domain: cms.request.host,
              pageName: cms.request.url,
              pageid: cms.cms.pageid,
              requestId: cms.cms["request-id"],
              errorType : "error"
            };
            /** @type {winston.Logger} */
            let logger = Logger.createContext(
              parameters,
              this.#service.settings._options.LogSettings
            );
            const result = await this.#service.processAsync(
              cms,
              req.fileContents,
              logger
            );
            const [code, headers, body] = await result.getResultAsync(logger);
            res.writeHead(code, headers);
            res.end(body);
          };
          await createCmsAndCreateResponseAsync();
        });
      } catch (ex) {
        console.error(ex);
        res.writeHead(StatusCodes.INTERNAL_SERVER_ERROR);
        res.end(ex.toString());
      }
    });
    return this._server;
  }
}
