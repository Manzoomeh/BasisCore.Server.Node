import IContext from "../Context/IContext.js";
import CommandBase from "./CommandBase.js";
import * as mimeTypes from "mime-types";
import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";
import JsonSource from "../Source/JsonSource.js";
import IToken from "../Token/IToken.js";
import TokenUtil from "../Token/TokenUtil.js";
export default class ApiCommand extends CommandBase {
  /*** @type {IToken}*/
  url;
  /*** @type {IToken}*/
  method;
  /*** @type {IToken}*/
  body;
  /*** @type {IToken}*/
  contentType;
  /*** @type {IToken}*/
  noCache;
  /**
   * @param {object} apiIl
   */
  constructor(apiIl) {
    super(apiIl);
    this.url = TokenUtil.getFiled(apiIl.extraAttributes, "url");
    this.method = TokenUtil.getFiled(apiIl.extraAttributes, "method");
    this.body = TokenUtil.getFiled(apiIl.extraAttributes, "body");
    this.contentType = TokenUtil.getFiled(apiIl.extraAttributes, "contentType");
    this.noCache = TokenUtil.getFiled(apiIl.extraAttributes, "noCache");
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const method = this.method.value.toUpperCase();
    if (method != "POST" && method != "GET" && method != "PUT" && method != "PATCH" && method != "DELETE") {
      throw new BasisCoreException(
        "Request of the API command should be correct"
      );
    }
    const requestConfig = {
      method,
      headers: {},
    };
    if (this.noCache.toLowerCase == "true") {
      requestConfig.headers["pragma"] = "no-cache";
      requestConfig.headers["cache-control"] = "no-cache";
    }
    if (!mimeTypes.contentType(this.contentType.value)) {
      throw new BasisCoreException("Invalid Content-type")
    }
    requestConfig.contentType = this.contentType.value;

    const response = await fetch(this.url.value,requestConfig);
    const contentType = response.headers.get("content-type");
    console.log(contentType);
    const data = {
      content: await response.json(),
      contentType,
    };
    const sourceName = this.name.value;
    context.addSource(new JsonSource([data], sourceName));
  }
}
