import IContext from "../Context/IContext.js";
import CommandBase from "./CommandBase.js";
import * as mimeTypes from "mime-types";
import BasisCoreException from "../../Models/Exceptions/BasisCoreException.js";
import JsonSource from "../Source/JsonSource.js";
import IToken from "../Token/IToken.js";
import TokenUtil from "../Token/TokenUtil.js";
import ValueToken from "../Token/ValueToken.js";

function readApiAttribute(apiIl, ...attributeNames) {
  const normalizedNames = new Set(
    attributeNames.map((name) => String(name).replace(/[-_]/g, "").toLowerCase())
  );
  const containers = [
    apiIl,
    apiIl?.extraAttributes,
    apiIl?.["extra-attribute"],
  ];

  for (const container of containers) {
    if (!container || typeof container !== "object") {
      continue;
    }
    const key = Object.keys(container).find((item) =>
      normalizedNames.has(String(item).replace(/[-_]/g, "").toLowerCase())
    );
    if (key !== undefined) {
      return container[key];
    }
  }
  return null;
}

function toApiToken(value) {
  return value == null ? ValueToken.Null : TokenUtil.ToToken(value);
}

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
    // Different ILParser versions expose API attributes directly, under
    // `extra-attribute`, or under the legacy `extraAttributes` property.
    // Reading only the latter silently removed url/method/body from atclient
    // API tags and left the browser requesting the configured origin root.
    this.url = toApiToken(readApiAttribute(apiIl, "url"));
    this.method = toApiToken(readApiAttribute(apiIl, "method"));
    this.body = toApiToken(readApiAttribute(apiIl, "body"));
    this.contentType = toApiToken(
      readApiAttribute(apiIl, "content-type", "contentType")
    );
    this.noCache = toApiToken(
      readApiAttribute(apiIl, "no-cache", "noCache")
    );
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _executeCommandAsync(context) {
    const method = this.method.value.toUpperCase();
    if (
      method != "POST" &&
      method != "GET" &&
      method != "PUT" &&
      method != "PATCH" &&
      method != "DELETE"
    ) {
      throw new BasisCoreException(
        "Request of the API command should be correct"
      );
    }
    const requestConfig = {
      method,
      headers: {},
    };
    if (method != "GET") {
      requestConfig.body = JSON.stringify(this?.body);
    }
    if (this.noCache.toLowerCase == "true") {
      requestConfig.headers["pragma"] = "no-cache";
      requestConfig.headers["cache-control"] = "no-cache";
    }
    if (!mimeTypes.contentType(this.contentType.value)) {
      throw new BasisCoreException("Invalid Content-type");
    }
    requestConfig.contentType = this.contentType.value;

    const response = await fetch(this.url.value, requestConfig);
    const contentType = response.headers.get("content-type");
    const data = {
      content: await response.json(),
      contentType,
    };
    const sourceName = this.name.value;
    context.addSource(new JsonSource([data], sourceName));
  }
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await Promise.all([
      tag.addAttributeIfExistAsync("method", this.method, context),
      tag.addAttributeIfExistAsync("url", this.url, context),
      tag.addAttributeIfExistAsync("body", this.body, context),
      tag.addAttributeIfExistAsync("content-type", this.contentType, context),
      tag.addAttributeIfExistAsync("no-cache", this.noCache, context),
    ]);
    return tag;
  }
}
