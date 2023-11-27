
import CommandBase from "./CommandBase.js";
import * as mimeTypes from "mime-types";
import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";
import axios from "axios";
import JsonSource from "../Source/JsonSource.js"
import TokenUtil from "../Token/TokenUtil.js";
import IToken from "../Token/IToken.js";
export default class ApiCommand extends CommandBase {
  /*** @type {string}*/
  url;
  /*** @type {string}*/
  method;
  /*** @type {string}*/
  body;
  /*** @type {IToken}*/
  name;
  /*** @type {string}*/
  contentType;
  /*** @type {string}*/
  noCache;
  constructor(il) {
    super(CommandBase);
    this.url = il.extraAttributes.url;
    this.method = il.extraAttributes.method;
    this.body = il.extraAttributes.name;
    this.name = TokenUtil.getFiled(il,"name")
    this.contentType = il.extraAttributes.contentType;
    this.noCache = il.extraAttributes.noCache;
    this.if = TokenUtil.getFiled(il,"if")
  }
  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */

  async _executeCommandAsync(context) {
    const method = this.method.toUpperCase();
    if (method != "POST" && method != "GET") {
      throw new BasisCoreException(
        " request of the API command should be get or post"
      );
    }
    const requestConfig = {
      method,
      url:this.url,
      headers: {},
    };
    if (this.noCache.toLowerCase == "true") {
      requestConfig.headers["pragma"] = "no-cache";
      requestConfig.headers["cache-control"] = "no-cache";
    }
    requestConfig.contentType = mimeTypes.contentType(this.contentType)
      ? this.contentType
      : "application/json";
    const response = await axios(requestConfig);
    console.log(response.headers)
    const contentType = response.headers["content-type"];
    console.log(contentType)
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = response.data
    } else if (contentType && contentType.includes("text/html")) {
      data = {
        content: response.data,
        contentType,
      };
    } else {
      data = {
        content: response.data,
      };
    }
    const sourcname = this.name.value
    context.addSource(new JsonSource(data,sourcname))
  }
}
