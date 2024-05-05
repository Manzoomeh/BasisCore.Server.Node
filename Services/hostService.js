import Index2Response from "../models/index2Response.js";
import Index5Response from "../models/index5Response.js";
import Index1Response from "../Models/Index1Response.js";
import Request from "../models/request.js";
import Response from "../models/response.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";
import StreamerEngine from "../fileStreamer/StreamerEngine.js";
import { HostServiceOptions } from "../models/model.js";
import IRoutingRequest from "../models/IRoutingRequest.js";
import ServiceSettings from "../models/ServiceSettings.js";
import Index4Response from "../models/Index4Response.js";
import LoadCommand from "../renderEngine/LoadCommand.js";

export default class HostService {
  /**@type {string} */
  name;
  /** @type {HostServiceOptions}*/
  _options;
  /** @type {StreamerEngine} */
  _engine = null;
  /** @type {ServiceSettings} */
  settings;
  /**@type {Object<string,any>} */
  _externalCommands;
  /**
   * @param {string} name
   *@param {HostServiceOptions} options
   */
  constructor(name, options) {
    this.name = name;
    this._options = options;
    if (this._options.Streamer) {
      this._engine = new StreamerEngine(this._options.Streamer);
    }
    this.settings = new ServiceSettings(options);
    this._externalCommands = LoadCommand.processSync(
      this._options.Settings.LibPath
    );
  }

  /**
   * @param {BinaryContent[]} contents
   * @param {Request} request
   * @returns {Promise<void>}
   */
  async _processUploadAsync(fileContents, request) {
    if (fileContents?.length > 0) {
      console.log("income:", fileContents.map((x) => x.toString()).join("\n"));
      if (this._engine) {
        const url = request.request["rawurl"];
        const urlPart = url.split("?");
        const queryString = urlPart.length >= 2 ? urlPart[1] : null;
        const report = await this._engine.processAsync(
          fileContents,
          queryString
        );
        if (report) {
          request.cms["upload_log"] = report;
        }
      } else {
        console.error("stream engine not config for file handling");
      }
    }
  }

  /**
   * @param {Request} request
   * @param {BinaryContent[]} fileContents
   * @returns {Promise<Response>}
   */
  processAsync(request, fileContents) {
    throw new Error("Not implemented!");
  }

  /**
   * @param {IRoutingRequest} request
   * @returns {Response}
   */
  _createResponse(request) {
    /**@type {Response} */
    let retVal = null;
    switch (request.webserver.index) {
      case "1": {
        retVal = new Index1Response(request, this.settings,this._externalCommands);
        break;
      }
      case "2": {
        retVal = new Index2Response(request, this.settings);
        break;
      }
      case "4": {
        retVal = new Index4Response(request, this.settings);

        break;
      }
      case "5": {
        retVal = new Index5Response(request, this.settings);
        break;
      }
      default: {
        throw new Error(
          `index type '${request.cms.webserver.index}' not supported in this version of web server.`
        );
      }
    }
    return retVal;
  }
}
