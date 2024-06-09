import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import RequestContext from "../renderEngine/Context/RequestContext.js";
import IRoutingRequest from "./IRoutingRequest.js";
import ServiceSettings from "./ServiceSettings.js";
import RequestBaseResponse from "./requestBaseResponse.js";
import RequestDebugContext from "./../renderEngine/Context/RequestDebugContext.js";
import RequestDebugMaxContext from "../renderEngine/Context/requestDebugMaxContext.js";
import DebugContext from "../renderEngine/Context/DebugContext.js";
import VoidContext from "../renderEngine/Context/VoidContext.js";
import StringResult from "../renderEngine/Models/StringResult.js";
import {Encoder} from "node-html-encoder"

export default class Index1Response extends RequestBaseResponse {
  /**@type {Object.<string, any>}*/
  _commands;
  /**
   * @param {IRoutingRequest} request
   * @param {ServiceSettings} settings
   * @param {Object.<string, any>} commands
   */
  constructor(request, settings, commands) {
    super(request, settings);
    this._commands = commands;
  }
  /**
   * @param {*} routingDataStep
   * @param {StringResult} rawRequest
   */
  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync(routingDataStep, rawRequest, cms) {
    try {
      const encoder = new Encoder("entity")
      if(this._request.cms.content){
        this._request.cms.content =encoder.htmlEncode(this._request.cms.content) 
      }
      /**@type {DebugContext} */
      const requestDebugContext =
        this._request.query?.debug == "true" ||
        this._request.query?.debug == "1"
          ? new RequestDebugContext(
              "logs for request",
              this._request.request["request-id"],
              routingDataStep,
              this._request,
              cms
            )
          : this._request.query?.debug == "2"
          ? new RequestDebugMaxContext(
              "logs for request",
              this._request.request["request-id"],
              routingDataStep,
              this._settings,
              this._request,
              cms
            )
          : new VoidContext("nothing");
      //getIl
      const getIlStep = requestDebugContext.newStep("Get IL");
      let commandIl;
      let command;
      try {
        if (!this._request.cms.page_il) {
          //Update IL step
        }
        if (this._request.cms.il_call) {
          //Update IL step
        }

        const deserializeJsonStep = requestDebugContext.newStep(
          "De-serialize Command(s)"
        );
        try {
          commandIl = JSON.parse(this._request.cms.page_il);
          deserializeJsonStep.complete();
        } catch (error) {
          console.log(error);
          deserializeJsonStep.failed();
        }
        const command = context.createCommand(commandIl);
        getIlStep.complete();
      } catch (error) {
        console.log(error);
        getIlStep.failed();
      }
      const context = new RequestContext(
        this._settings,
        this._request,
        this._commands,
        requestDebugContext
      );
      context.cancellation = new CancellationToken();
      const result = await command.executeAsync(context);
      const renderResultList = [];
      await result.writeAsync(renderResultList, context.cancellation);
      await context.debugContext.writeAsync(
        renderResultList,
        context.cancellation
      );
      await rawRequest?.writeAsync(renderResultList, context.cancellation);
      return [
        parseInt(this._request.webserver.headercode.split(" ")[0]),
        {
          ...{ "content-type": this._request.webserver.mime },
          ...(this._request.webserver.gzip === "true" && {
            "Content-Encoding": "gzip",
          }),
          ...this._request.http,
          ...(context._cookies &&
            Object.fromEntries(
              context._cookies.map((x) => x.toHttpHeaderField())
            )),
        },
        renderResultList.join(""),
      ];
    } catch (ex) {
      console.error(ex);
    }
  }
}
