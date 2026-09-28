import http from "http";
import net from "net";
import dayjs from "dayjs";
import url from "url";
import HostEndPoint from "./hostEndPoint.js";
import Request from "../Models/request.js";
import ObjectUtil from "../modules/objectUtil.js";
import busboy from "busboy";
import { IncomingMessage, ServerResponse } from "http";
import BasisCoreException from "../Models/Exceptions/BasisCoreException.js";
import BinaryContent from "../fileStreamer/Models/BinaryContent.js";
import StringResult from "../renderEngine/Models/StringResult.js";
import HostService from "../Services/hostService.js";
import RabbitMQCacheManager from "./../Models/CacheCommands/RabbitMQCacheManager.js";
import BasecacheManager from "../Models/CacheCommands/BaseCacheManager.js";
import CacheConnectionBase from "../Models/CacheCommands/CacheConnection/CacheConnectionBase.js";
import { HostEndPointOptions } from "../Models/model.js";
import SqliteCacheConnection from "../Models/CacheCommands/CacheConnection/SqliteCacheConnection.js";
import CacheSettings from "../Models/options/CacheSettings.js";
import { contentType } from "mime-types";
import { StatusCodes } from "http-status-codes";
import {
  traceRequest,
  traceError,
  traceIncomingHttpRequest,
  getRequestTraceId,
  resolveClientIp,
  getForwardedFor,
} from "../modules/requestTrace.js";
import { checkIpBlocked } from "../modules/ipBlocklist.js";
import { withCommonResponseHeaders } from "../modules/responseHeaders.js";
import {
  enrichLegacyFormFields,
  getLegacyJsonHeader,
  parseBodyFormFields,
} from "../modules/requestBody.js";

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

/**
 * @param {unknown} value
 * @param {boolean} fallback
 * @returns {boolean}
 */
function toBool(value, fallback = false) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return fallback;
  }
  return TRUE_VALUES.has(normalized);
}
let requestId = 0;
class HttpHostEndPoint extends HostEndPoint {
  /** @type {HostService} */
  _service;
  /** @type {HostEndPointOptions} */
  _cacheOptions;
  /** @type {CacheConnectionBase?} */
  _cacheConnection;
  /** @type {http.Server} */
  _server;
  /** @type {boolean} */
  _blockIpHostHeaderEnabled;
  /** @type {string[]} */
  _allowedHostRules;
  /**
   *
   * @param {string} ip
   * @param {number} port
   * @param {HostService}
   * @param {CacheSettings}cacheOptions
   */
  constructor(ip, port, service, cacheOptions) {
    super(ip, port);
    this._service = service;
    this._cacheOptions = cacheOptions;
    this._blockIpHostHeaderEnabled = toBool(
      process.env.BLOCK_IP_HOST_HEADER_ENABLED,
      true
    );
    this._allowedHostRules = this._parseAllowedHosts(process.env.ALLOWED_HOSTS || "");
    if (cacheOptions && cacheOptions.connectionType) {
      switch (cacheOptions.connectionType) {
        case "sqlite": {
          this._cacheConnection = new SqliteCacheConnection(
            cacheOptions.connectionSetting
          );
          break;
        }
        default: {
          throw new BasisCoreException(
            `the connection type ${cacheOptions.connectionType} not implemented for caching!`
          );
        }
      }
    }
  }

  /** @returns {Server}*/
  _createServer() {
    throw Error("_createServer not implemented in this type of end point!");
  }

  /**@returns {Promise<void>} */
  async listenAsync() {
    /** @type {BasecacheManager} */
    let cacheManager;
    switch (this._cacheOptions?.managerType) {
      case "Rabbit": {
        cacheManager = new RabbitMQCacheManager(
          this._cacheConnection,
          this._cacheOptions.managerSetting
        );
      }
    }
    if (cacheManager) {
      await cacheManager.initializeAsync();
    }
    const server = this._createServer();
    await this.initializeAsync();
    traceRequest("endpoint.listen.prepare", {
      ip: this._ip,
      port: this._port,
      service: this._service?.name || "",
    });
    await new Promise((resolve, reject) => {
      const onError = (error) => {
        server.off("listening", onListening);
        reject(error);
      };
      const onListening = () => {
        server.off("error", onError);
        console.log(`start listening over ${this._ip}:${this._port}`);
        traceRequest("endpoint.listen.started", {
          ip: this._ip,
          port: this._port,
          service: this._service?.name || "",
        });
        resolve();
      };

      server.once("error", onError);
      server.once("listening", onListening);
      server.on("error", (error) => console.error(error));
      server.listen(this._port, this._ip);
    });
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  _extractHostName(value) {
    const raw = String(value || "")
      .trim()
      .toLowerCase();
    if (!raw) {
      return "";
    }
    let host = raw.split(",")[0].trim();
    if (!host) {
      return "";
    }
    if (host.startsWith("http://") || host.startsWith("https://")) {
      try {
        host = new URL(host).host;
      } catch (_) {
        // keep raw host candidate
      }
    }
    if (host.startsWith("[")) {
      const closeBracketIndex = host.indexOf("]");
      if (closeBracketIndex > 0) {
        return host.slice(1, closeBracketIndex).replace(/\.$/, "");
      }
      return host.replace(/^\[|\]$/g, "").replace(/\.$/, "");
    }
    const colonCount = (host.match(/:/g) || []).length;
    if (colonCount === 1) {
      const [candidateHost, candidatePort] = host.split(":");
      if (/^\d+$/.test(candidatePort || "")) {
        host = candidateHost;
      }
    }
    return host.replace(/\.$/, "");
  }

  /**
   * @param {string} value
   * @returns {string[]}
   */
  _parseAllowedHosts(value) {
    return String(value || "")
      .split(",")
      .map((item) => String(item || "").trim().toLowerCase())
      .filter(Boolean)
      .map((item) => {
        if (item.startsWith("*.")) {
          const suffix = this._extractHostName(item.slice(2));
          return suffix ? `*.${suffix}` : "";
        }
        return this._extractHostName(item);
      })
      .filter(Boolean);
  }

  /**
   * @param {string} host
   * @returns {boolean}
   */
  _isHostAllowed(host) {
    if (!host) {
      return false;
    }
    if (!this._allowedHostRules.length) {
      return true;
    }
    return this._allowedHostRules.some((rule) => {
      if (rule.startsWith("*.")) {
        const suffix = rule.slice(2);
        return host === suffix || host.endsWith(`.${suffix}`);
      }
      return host === rule;
    });
  }

  /**
   * @param {NodeJS.Dict<string|string[]|number|boolean>} headers
   * @returns {{ rawHost: string; host: string }}
   */
  _resolveHostFromHeaders(headers = {}) {
    const rawHost =
      this._readHeaderValue(headers, "x-forwarded-host") ||
      this._readHeaderValue(headers, ":authority") ||
      this._readHeaderValue(headers, "host");
    return {
      rawHost,
      host: this._extractHostName(rawHost),
    };
  }

  /**
   * @param {string} host
   * @param {string} reason
   * @param {string} rule
   * @returns {string}
   */
  _buildHostBlockedPayload(host, reason, rule = "") {
    return JSON.stringify({
      error: "forbidden",
      message: "request_blocked_by_host_policy",
      host: String(host || ""),
      reason: String(reason || ""),
      rule: String(rule || ""),
    });
  }

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @param {string} protocol
   * @returns {boolean}
   */
  _checkHostPolicyForHttp(req, res, protocol = "http1") {
    const clientIp = resolveClientIp({ headers: req?.headers, socket: req?.socket });
    const forwardedFor = getForwardedFor({ headers: req?.headers });
    const { rawHost, host } = this._resolveHostFromHeaders(req?.headers || {});
    const ipVersion = net.isIP(host);
    const hostMatchedAllowlist = this._allowedHostRules.length
      ? this._isHostAllowed(host)
      : false;

    if (hostMatchedAllowlist) {
      return false;
    }

    let reason = "";
    let rule = "";
    if (!host) {
      reason = "missing-host";
    } else if (this._blockIpHostHeaderEnabled && ipVersion !== 0) {
      reason = "ip-host-header";
    } else if (this._allowedHostRules.length) {
      reason = "host-not-allowed";
      rule = this._allowedHostRules.join(",");
    } else {
      return false;
    }

    traceRequest(
      "security.host.blocked",
      {
        protocol,
        method: req?.method || "",
        url: req?.url || "",
        host: rawHost,
        normalizedHost: host,
        reason,
        rule,
        blockIpHostHeaderEnabled: this._blockIpHostHeaderEnabled,
        clientIp,
        forwardedFor,
      },
      "warn"
    );
    this._writeIpBlockedHttpResponse(
      res,
      this._buildHostBlockedPayload(host || rawHost, reason, rule)
    );
    return true;
  }

  /**
   * @param {import("http2").ServerHttp2Stream} stream
   * @param {NodeJS.Dict<string|string[]|number|boolean>} headers
   * @param {string} protocol
   * @returns {boolean}
   */
  _checkHostPolicyForHttp2(stream, headers, protocol = "http2") {
    const clientIp = resolveClientIp({ headers });
    const forwardedFor = getForwardedFor({ headers });
    const { rawHost, host } = this._resolveHostFromHeaders(headers || {});
    const ipVersion = net.isIP(host);
    const hostMatchedAllowlist = this._allowedHostRules.length
      ? this._isHostAllowed(host)
      : false;

    if (hostMatchedAllowlist) {
      return false;
    }

    let reason = "";
    let rule = "";
    if (!host) {
      reason = "missing-host";
    } else if (this._blockIpHostHeaderEnabled && ipVersion !== 0) {
      reason = "ip-host-header";
    } else if (this._allowedHostRules.length) {
      reason = "host-not-allowed";
      rule = this._allowedHostRules.join(",");
    } else {
      return false;
    }

    traceRequest(
      "security.host.blocked",
      {
        protocol,
        method: String(headers?.[":method"] || ""),
        url: String(headers?.[":path"] || ""),
        host: rawHost,
        normalizedHost: host,
        reason,
        rule,
        blockIpHostHeaderEnabled: this._blockIpHostHeaderEnabled,
        clientIp,
        forwardedFor,
      },
      "warn"
    );
    this._writeIpBlockedHttp2Response(
      stream,
      this._buildHostBlockedPayload(host || rawHost, reason, rule)
    );
    return true;
  }

  /**
   * @param {string} urlStr
   * @param {string} method
   * @param {http.IncomingHttpHeaders} requestHeaders
   * @param {NodeJS.Dict<string>} formFields
   * @param {Socket} socket
   * @param {NodeJS.Dict} bodyFields
   * @param {boolean} isSecure
   * @returns {Promise<Request>}
   */
  async _createCmsObjectAsync(
    urlStr,
    method,
    headers,
    formFields,
    jsonHeaders,
    socket,
    bodyStr,
    isSecure
  ) {
    // console.log("qam 3",`${headers["host"]}${urlStr}`)
    const rawUrl = urlStr.substring(1);
    const urlObject = url.parse(rawUrl, true);
    formFields = enrichLegacyFormFields(formFields || {});
    const legacyJsonHeader = getLegacyJsonHeader(formFields);
    headers["request-id"] = (++requestId).toString();
    headers["methode"] = method.toLowerCase();
    headers["rawurl"] = decodeURIComponent(rawUrl);
    headers["url"] = decodeURIComponent(urlObject.pathname ?? "");
    headers["full-url"] = decodeURIComponent(`${headers["host"]}${urlStr}`);
    headers["hostip"] = socket.localAddress;
    headers["hostport"] = socket.localPort?.toString();
    headers["clientip"] = socket.remoteAddress;
    headers[":path"] = "/" + decodeURIComponent(rawUrl);
    if (legacyJsonHeader !== null) {
      headers["json"] = { header: legacyJsonHeader };
    } else if (Object.keys(jsonHeaders || {}).length > 0) {
      headers["json"] = {
        header: ObjectUtil.convertObjectToNestedStructure(jsonHeaders),
      };
    } else {
      headers["json"] = {};
    }
    headers.body = bodyStr;
    const forwardedProto = this
      ._readHeaderValue(headers, "x-forwarded-proto")
      .split(",")[0]
      .trim()
      .toLowerCase();
    const forwardedIsSecure = forwardedProto === "https";
    const now = dayjs();
    const request = new Request();
    request.isSecure = isSecure || forwardedIsSecure;
    request.request = headers;
    // cms.json is a top-level legacy source. Keeping the same value under
    // cms.request.json is useful for raw request diagnostics, but templates
    // such as cms.json.header cannot resolve it from there.
    request.json = headers["json"];
    request.cms = {
      date: now.format("MM/DD/YYYY"),
      time: now.format("HH:mm A"),
      date2: now.format("YYYYMMDD"),
      time2: now.format("HHmmss"),
      date3: now.format("YYYY.MM.DD"),
    };
    if (urlObject.query) {
      const query = {};
      let hasQuery = false;
      for (const key in urlObject.query) {
        const value = urlObject.query[key];
        query[key] = value;
        // Some legacy pages read URL params from cms.request instead of cms.query.
        if (
          key !== "__proto__" &&
          key !== "constructor" &&
          key !== "prototype" &&
          !Object.hasOwn(headers, key)
        ) {
          headers[key] = value;
        }
        hasQuery = true;
      }
      if (hasQuery) {
        request["query"] = query;
      }
    }
    request["form"] = formFields;
    const clientIp = resolveClientIp({ headers, socket });
    const forwardedFor = getForwardedFor({ headers });
    traceRequest("request.cms.created", {
      traceId: headers["request-id"] || "",
      service: this._service?.name || "",
      method: headers["methode"] || "",
      url: headers["url"] || "",
      fullUrl: headers["full-url"] || "",
      isSecure: !!request.isSecure,
      forwardedProto,
      clientIp,
      forwardedFor,
      queryKeys: request?.query ? Object.keys(request.query) : [],
      formKeys: formFields ? Object.keys(formFields) : [],
      jsonKeys: request?.json ? Object.keys(request.json) : [],
      jsonHeaderBytes: Buffer.byteLength(request?.json?.header || ""),
    });
    return request;
  }
  /**
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  _securityHeadersMiddleware(req, res, next) {
    req.url = req.url.replace(/[\n\r]|%0a|%0d/gi, " ");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains; preload"
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    // res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");

    if (typeof next === "function") {
      next();
    }
  }

  /**
   * @param {NodeJS.Dict<string|string[]|number|boolean>} headers
   * @param {string} name
   * @returns {string}
   */
  _readHeaderValue(headers, name) {
    if (!headers) {
      return "";
    }
    const raw =
      headers[name] ??
      headers[name.toLowerCase()] ??
      headers[name.toUpperCase()] ??
      "";
    const value = Array.isArray(raw) ? raw[0] : raw;
    return String(value ?? "").trim();
  }

  /**
   * @param {NodeJS.Dict<string|string[]|number|boolean>} requestHeaders
   * @returns {NodeJS.Dict<string>}
   */
  _buildCorsHeaders(requestHeaders) {
    const origin = this._readHeaderValue(requestHeaders, "origin");
    if (!origin) {
      return {};
    }
    const requestedHeaders =
      this._readHeaderValue(requestHeaders, "access-control-request-headers") ||
      "Content-Type, Authorization";
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": requestedHeaders,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    };
  }

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @returns {boolean}
   */
  _handleCorsPreflight(req, res) {
    if (String(req?.method || "").toUpperCase() !== "OPTIONS") {
      return false;
    }
    res.writeHead(
      StatusCodes.NO_CONTENT,
      this._withCommonResponseHeaders(this._buildCorsHeaders(req?.headers))
    );
    res.end();
    return true;
  }

  /**
   * @param {import("http2").ServerHttp2Stream} stream
   * @param {NodeJS.Dict<string|string[]|number|boolean>} headers
   * @returns {boolean}
   */
  _handleCorsPreflightH2(stream, headers) {
    const method = String(headers?.[":method"] || headers?.method || "").toUpperCase();
    if (method !== "OPTIONS") {
      return false;
    }
    stream.respond(
      this._withCommonResponseHeaders({
        ":status": StatusCodes.NO_CONTENT,
        ...this._buildCorsHeaders(headers),
      })
    );
    stream.end();
    return true;
  }

  /**
   * @param {string} ip
   * @param {string} rule
   * @returns {string}
   */
  _buildIpBlockedPayload(ip, rule) {
    return JSON.stringify({
      error: "forbidden",
      message: "request_blocked_by_ip_policy",
      ip: String(ip || ""),
      rule: String(rule || ""),
    });
  }

  /**
   * @param {ServerResponse} res
   * @param {string} payload
   */
  _writeIpBlockedHttpResponse(res, payload) {
    if (!res || res.writableEnded) {
      return;
    }
    try {
      if (!res.headersSent) {
        res.writeHead(
          StatusCodes.FORBIDDEN,
          this._withCommonResponseHeaders({
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          })
        );
      }
      res.end(payload);
    } catch (_) {
      try {
        res.end(payload);
      } catch (_) {
        // ignore
      }
    }
  }

  /**
   * @param {import("http2").ServerHttp2Stream} stream
   * @param {string} payload
   */
  _writeIpBlockedHttp2Response(stream, payload) {
    if (!stream || stream.closed || stream.destroyed) {
      return;
    }
    try {
      stream.respond(
        this._withCommonResponseHeaders({
          ":status": StatusCodes.FORBIDDEN,
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        })
      );
      stream.end(payload);
    } catch (_) {
      try {
        stream.end(payload);
      } catch (_) {
        // ignore
      }
    }
  }

  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   * @param {string} protocol
   * @returns {boolean}
   */
  _checkIpBlockForHttp(req, res, protocol = "http1") {
    const clientIp = resolveClientIp({ headers: req?.headers, socket: req?.socket });
    const forwardedFor = getForwardedFor({ headers: req?.headers });
    const decision = checkIpBlocked(clientIp);
    if (!decision.blocked) {
      return false;
    }
    traceRequest(
      "security.ip.blocked",
      {
        protocol,
        method: req?.method || "",
        url: req?.url || "",
        host: req?.headers?.host || "",
        clientIp,
        forwardedFor,
        rule: decision.rule,
        blocklistPath: decision.source || "",
      },
      "warn"
    );
    this._writeIpBlockedHttpResponse(
      res,
      this._buildIpBlockedPayload(clientIp, decision.rule)
    );
    return true;
  }

  /**
   * @param {import("http2").ServerHttp2Stream} stream
   * @param {NodeJS.Dict<string|string[]|number|boolean>} headers
   * @param {string} protocol
   * @returns {boolean}
   */
  _checkIpBlockForHttp2(stream, headers, protocol = "http2") {
    const clientIp = resolveClientIp({ headers });
    const forwardedFor = getForwardedFor({ headers });
    const decision = checkIpBlocked(clientIp);
    if (!decision.blocked) {
      return false;
    }
    traceRequest(
      "security.ip.blocked",
      {
        protocol,
        method: String(headers?.[":method"] || ""),
        url: String(headers?.[":path"] || ""),
        host: String(headers?.[":authority"] || headers?.host || ""),
        clientIp,
        forwardedFor,
        rule: decision.rule,
        blocklistPath: decision.source || "",
      },
      "warn"
    );
    this._writeIpBlockedHttp2Response(
      stream,
      this._buildIpBlockedPayload(clientIp, decision.rule)
    );
    return true;
  }

  /**
   * @param {NodeJS.Dict<any>} responseHeaders
   * @param {NodeJS.Dict<string|string[]|number|boolean>} requestHeaders
   * @returns {NodeJS.Dict<any>}
   */
  _mergeCorsHeaders(responseHeaders = {}, requestHeaders = {}) {
    const corsHeaders = this._buildCorsHeaders(requestHeaders);
    if (Object.keys(corsHeaders).length === 0) {
      return responseHeaders;
    }
    const merged = { ...responseHeaders, ...corsHeaders };
    const existingVary = responseHeaders?.Vary || responseHeaders?.vary;
    if (existingVary) {
      const values = new Set(
        String(existingVary)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      );
      values.add("Origin");
      merged.Vary = Array.from(values).join(", ");
      delete merged.vary;
    }
    return merged;
  }
  /**
   *
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  async _handleContentTypes(req, res, next) {
    traceIncomingHttpRequest(req, req?.httpVersion === "2.0" ? "http2" : "http1");
    traceRequest("request.body.parse.start", {
      traceId: getRequestTraceId({ headers: req?.headers }),
      method: req?.method || "",
      url: req?.url || "",
      contentType: req?.headers?.["content-type"] || "",
      contentLength: req?.headers?.["content-length"] || "",
    });
    let body = "";
    if (req.headers["content-length"]) {
      if (req.headers["content-type"]?.startsWith("multipart/form-data")) {
        const bb = busboy({ headers: req.headers });
        /**@type {BinaryContent[]} */
        let fileContents = [];
        /**@type {NodeJS.Dict<string>} */
        let formFields = {};
        /**@type {NodeJS.Dict<string>} */
        let jsonHeaders = {};
        bb.on("file", (name, file, info) => {
          const ContentParts = [];
          file.on("data", (x) => ContentParts.push(x));
          file.on("end", async () => {
            const content = new BinaryContent();
            content.url = `${req.headers["host"]}${req.url}`;
            content.mime = info.mimeType.toLowerCase();
            content.name = info.filename;
            content.payload = Buffer.concat(ContentParts);
            fileContents.push(content);
          });
        });
        bb.on("field", (name, val, info) => {
          formFields[name] = val;
          if (name.startsWith("_")) {
            jsonHeaders[name] = val;
          }
        });
        bb.on("close", () => {
          req.formFields = formFields;
          req.fileContents = fileContents;
          req.jsonHeaders = jsonHeaders;
          traceRequest("request.body.parse.multipart.done", {
            traceId: getRequestTraceId({ headers: req?.headers }),
            url: req?.url || "",
            formKeys: Object.keys(formFields || {}),
            fileCount: fileContents.length,
            jsonHeaderKeys: Object.keys(jsonHeaders || {}),
          });
          next();
        });
        req.pipe(bb);
      } else {
        try {
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            if (body.length == 0) {
              traceRequest("request.body.parse.done", {
                traceId: getRequestTraceId({ headers: req?.headers }),
                url: req?.url || "",
                hasBody: false,
              });
              next();
            } else {
              req.bodyStr = body;
              const parsedFormFields = parseBodyFormFields(
                body,
                req.headers["content-type"]
              );
              if (parsedFormFields) {
                req.formFields = parsedFormFields;
              }
              traceRequest("request.body.parse.done", {
                traceId: getRequestTraceId({ headers: req?.headers }),
                url: req?.url || "",
                hasBody: true,
                bodyBytes: Buffer.byteLength(body),
                formKeys: Object.keys(req.formFields || {}),
              });
              next();
            }
          });
        } catch (error) {
          traceError("request.body.parse.error", error, {
            traceId: getRequestTraceId({ headers: req?.headers }),
            url: req?.url || "",
          });
          throw new BasisCoreException("invalid JSON on body");
        }
      }
    } else {
      traceRequest("request.body.parse.skip", {
        traceId: getRequestTraceId({ headers: req?.headers }),
        url: req?.url || "",
        reason: "missing-content-length",
      });
      next();
    }
  }
  addStringTable(title, content) {
    const html = `
          <table class='cms-data-member'>
              <thead>
                  <tr>
                      <th>${title}</th>                   
                  </tr>
                  <tr>
                      <th>Value</th>                   
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>${content}</td>
                  </tr>
              </tbody>
          </table>
      `;
    return new StringResult(html);
  }
  joinHeaders(array) {
    const joinedheaders = array
      .reduce((acc, curr, index, arr) => {
        if (index % 2 === 0) {
          acc.push(arr.slice(index, index + 2).join(" : "));
        }
        return acc;
      }, [])
      .join("<br>");
    return this.addStringTable("Raw Request", joinedheaders);
  }
  /**
   * @param {number|string} statusCode
   * @param {NodeJS.Dict<any>} headers
   * @param {*} body
   * @param {NodeJS.Dict<string|string[]|number|boolean>} requestHeaders
   * @returns {[number, NodeJS.Dict<string|string[]|number>, string|Buffer]}
   */
  _prepareOutgoingResponse(statusCode, headers = {}, body = "", requestHeaders = {}) {
    let code = Number(statusCode);
    if (!Number.isFinite(code) || code < 100 || code > 599) {
      code = 200;
    }
    const mergedHeaders = this._mergeCorsHeaders(headers || {}, requestHeaders || {});
    const filteredHeaders = this._sanitizeResponseHeaders(mergedHeaders);
    let responseBody = body;
    if (responseBody == null) {
      responseBody = "";
    } else if (Buffer.isBuffer(responseBody) || typeof responseBody === "string") {
      // keep as-is
    } else if (responseBody instanceof Uint8Array) {
      responseBody = Buffer.from(responseBody);
    } else {
      try {
        responseBody = JSON.stringify(responseBody);
      } catch (_) {
        responseBody = String(responseBody);
      }
      if (!filteredHeaders["content-type"] && !filteredHeaders["Content-Type"]) {
        filteredHeaders["content-type"] = "application/json; charset=utf-8";
      }
    }
    return [code, this._withCommonResponseHeaders(filteredHeaders), responseBody];
  }

  _withCommonResponseHeaders(headers = {}) {
    return withCommonResponseHeaders(headers);
  }

  /**
   * @param {NodeJS.Dict<any>} headers
   * @returns {NodeJS.Dict<string|string[]|number>}
   */
  _sanitizeResponseHeaders(headers = {}) {
    const hopByHopHeaders = new Set([
      "connection",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailer",
      "transfer-encoding",
      "upgrade",
    ]);
    const validHeaderName = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    /** @type {NodeJS.Dict<string|string[]|number>} */
    const result = {};
    Object.entries(headers || {}).forEach(([rawName, rawValue]) => {
      const name = String(rawName || "").trim();
      if (!name || !validHeaderName.test(name)) {
        return;
      }
      if (hopByHopHeaders.has(name.toLowerCase())) {
        return;
      }
      if (rawValue == null) {
        return;
      }
      if (Array.isArray(rawValue)) {
        const values = rawValue
          .map((x) => String(x ?? "").trim())
          .filter((x) => x.length > 0);
        if (values.length > 0) {
          result[name] = values;
        }
        return;
      }
      if (typeof rawValue === "number") {
        result[name] = rawValue;
        return;
      }
      result[name] = String(rawValue);
    });
    return result;
  }

  /**
   * @param {ServerResponse} res
   * @param {unknown} error
   */
  _writeSafeInternalError(res, error) {
    const payload = JSON.stringify({
      error: "internal_server_error",
      message: String(error?.message || error || ""),
    });
    if (res.writableEnded) {
      return;
    }
    try {
      if (!res.headersSent) {
        res.writeHead(
          StatusCodes.INTERNAL_SERVER_ERROR,
          this._withCommonResponseHeaders({
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          })
        );
      }
      res.end(payload);
    } catch (_) {
      try {
        res.end(payload);
      } catch (_) {
        // ignore double-fault while terminating response
      }
    }
  }
  /**
   * @param {IncomingMessage} req
   * @param {ServerResponse} res
   */
  async _checkCacheAsync(req, res, next) {
    const urlObject = url.parse(req.url, true);
    const traceId = getRequestTraceId({ headers: req?.headers });
    if (
      !urlObject?.query.refresh &&
      this._cacheOptions &&
      this._cacheOptions.isEnabled &&
      this._cacheOptions.requestMethods.includes(req.method) &&
      this._cacheConnection
    ) {
      const fullUrl = `${req.headers.host}${req.url}`;
      traceRequest("cache.lookup", {
        traceId,
        key: fullUrl,
        method: req?.method || "",
      });
      const cacheResults = await this._cacheConnection.loadContentAsync(
        fullUrl
      );
      if (cacheResults) {
        traceRequest("cache.hit", {
          traceId,
          key: fullUrl,
          method: req?.method || "",
        });
        res.writeHead(
          200,
          this._withCommonResponseHeaders({
            ...cacheResults.properties,
          })
        );
        res.write(cacheResults.file ?? "");
        res.end();
      } else {
        traceRequest("cache.miss", {
          traceId,
          key: fullUrl,
          method: req?.method || "",
        });
        next();
      }
    } else {
      traceRequest("cache.skip", {
        traceId,
        method: req?.method || "",
        url: req?.url || "",
      });
      next();
    }
  }
  /**
   *
   * @param {string} key
   * @param {string} content
   * @param {NodeJS.Dict<string>} headers
   * @returns {Promise<void>}
   */
  async addCacheContentAsync(key, content, headers, method) {
    if (
      this._cacheOptions &&
      this._cacheOptions.isEnabled &&
      this._cacheOptions.requestMethods.includes(method) &&
      this._cacheConnection
    ) {
      const savedHeaders = this.findProperties(
        headers,
        this._cacheOptions.responseHeaders
      );
      await this._cacheConnection.addCacheContentAsync(
        this.removeQueryParam(key, 'refresh'),
        content,
        savedHeaders
      );
    }
  }
  sanitizeInput(input) {
    let inputStr = String(input);
    inputStr = inputStr.replace(/[\n\r]|%0a|%0d/gi, "");

    return inputStr;
  }
  removeQueryParam(url, param) {
    let [baseUrl, queryString] = url.split('?');
    if (!queryString) return url; // No query string

    let queryParams = queryString.split('&');
    queryParams = queryParams.filter(pair => !pair.startsWith(param + '='));

    return queryParams.length ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;
}
  /**
   *
   * @param {NodeJS.Dict} headers
   * @param {string[]} keys
   * @returns
   */
  findProperties(headers, keys) {
    const properties = {};
    keys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        properties[key] = headers[key];
      }
    });
    return properties;
  }
  initializeAsync() {
    return this._service.initializeAsync();
  }
  kill() {
    this._server.close();
    console.log(`server ip ${this._ip} and port ${this._port} killed`);
  }
  _sqlInjectionMiddleware = (req, res, next) => {
    next()
// const url = new URL(req.url, `http://${req.headers.host}`);
    
//     const queryString = url.search; 


//     const sqlInjectionPattern = /[\s'";()&|]|(SELECT|select|INSERT|insert|DELETE|delete|UPDATE|update|WHERE|where|DROP|drop|EXEC|exec|UNION|union|--|\*|#|\/\*|\/\*.*?\*\/)/;


//     if (sqlInjectionPattern.test(queryString)) {

//         res.writeHead(400, { 'Content-Type': 'text/plain' });
//         res.end('Bad Request: Potential SQL injection detected.');
//     } else {

//         next();
//     }
};
}
export default HttpHostEndPoint;
