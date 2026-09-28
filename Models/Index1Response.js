import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import RequestContext from "../renderEngine/Context/RequestContext.js";
import IRoutingRequest from "./IRoutingRequest.js";
import ServiceSettings from "./ServiceSettings.js";
import RequestBaseResponse from "./RequestBaseResponse.js";
import RequestDebugContext from "./../renderEngine/Context/RequestDebugContext.js";
import RequestDebugMaxContext from "../renderEngine/Context/RequestDebugMaxContext.js";
import DebugContext from "../renderEngine/Context/DebugContext.js";
import VoidContext from "../renderEngine/Context/VoidContext.js";
import StringResult from "../renderEngine/Models/StringResult.js";
import {
  hasSaveHtmlPayload,
  persistSaveHtmlToDisk,
  readSaveHtmlPayloadFromRequest,
} from "../modules/saveHtmlCache.js";
import { Encoder } from "node-html-encoder";
import { gzip } from 'zlib';
import { promisify } from 'util';
import { getRequestTraceId, traceError, traceRequest } from "../modules/requestTrace.js";

const gzipAsync = promisify(gzip);
const IL_PARSER_URL = String(
  process.env.IL_PARSER_URL || "http://ilparser:8080/ilparser"
).trim();
const DEFAULT_IL_PARSER_TIMEOUT_MS = 15000;
const IL_PARSER_DIAGNOSTICS_ENABLED = ["1", "true", "yes"].includes(
  String(process.env.IL_PARSER_DIAGNOSTICS || "").trim().toLowerCase()
);
const IL_PARSER_DIAGNOSTIC_MAX_TAGS = 80;

function resolveIlParserTimeoutMs() {
  const timeoutMs = Number(process.env.IL_PARSER_TIMEOUT_MS || "");
  return Number.isFinite(timeoutMs) && timeoutMs > 0
    ? timeoutMs
    : DEFAULT_IL_PARSER_TIMEOUT_MS;
}

function traceIndex1(stage, request, startedAt, payload = {}) {
  traceRequest(`index1.${stage}`, {
    traceId: getRequestTraceId(request),
    elapsedMs: Date.now() - startedAt,
    ...payload,
  });
}

function truncateForLog(value, maxLength = 1200) {
  const text = String(value ?? "");
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

async function readResponseTextSafe(response) {
  try {
    return await response.text();
  } catch (error) {
    return `failed to read ilparser response body: ${String(error || "")}`;
  }
}

function readBasisAttribute(tag, attributeName) {
  const escapedName = attributeName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(
    `\\b${escapedName}\\s*=\\s*(["'])(.*?)\\1`,
    "i"
  ).exec(tag);
  return match?.[2] || "";
}

function getBasisTagDiagnostics(content) {
  const tags = String(content ?? "").match(/<basis\b[^>]*>/gi) || [];
  return tags.slice(0, IL_PARSER_DIAGNOSTIC_MAX_TAGS).map((tag, index) => ({
    index,
    tag,
    core: readBasisAttribute(tag, "core"),
    name: readBasisAttribute(tag, "name"),
  }));
}

async function diagnoseIlParserFailure(content) {
  if (!IL_PARSER_DIAGNOSTICS_ENABLED) {
    return;
  }

  const inputTagCount = (String(content ?? "").match(/<basis\b[^>]*>/gi) || [])
    .length;
  const tags = getBasisTagDiagnostics(content);
  const results = [];

  for (const item of tags) {
    if (!item.core) {
      continue;
    }

    const sample = /\/\s*>$/.test(item.tag)
      ? item.tag
      : `${item.tag}</basis>`;

    try {
      const response = await fetch(IL_PARSER_URL, {
        body: sample,
        method: "POST",
        signal: AbortSignal.timeout(5000),
      });
      await response.arrayBuffer();
      results.push({
        index: item.index,
        core: item.core,
        name: item.name,
        status: response.status,
      });
    } catch (error) {
      results.push({
        index: item.index,
        core: item.core,
        name: item.name,
        error: String(error || ""),
      });
    }
  }

  console.warn("ilparser diagnostic tag results", {
    inputTagCount,
    testedTagCount: results.length,
    omittedTagCount: Math.max(0, inputTagCount - tags.length),
    failedTags: results.filter((item) => item.status !== 200),
  });
}

function normalizeLegacyIlParserContent(content) {
  return String(content ?? "").replace(/<basis\b[^>]*>/gi, (tag) => {
    const isLegacyFlyDbSource =
      /\bcore\s*=\s*(['"])external\.fly\.ws\1/i.test(tag) &&
      /\bprocedurename\s*=\s*(['"])dbsource\1/i.test(tag);

    if (!isLegacyFlyDbSource) {
      return tag;
    }

    return tag.replace(
      /\bcore\s*=\s*(['"])external\.fly\.ws\1/i,
      "core=$1dbsource$1"
    );
  });
}

/**
 * @param {string} content
 * @returns {Promise<any>}
 */
async function parseIlContentAsync(content) {
  const normalizedContent = normalizeLegacyIlParserContent(content);
  const legacyExternalFlyDbsourceNormalized = normalizedContent !== String(content ?? "");
  const timeoutMs = resolveIlParserTimeoutMs();
  const response = await fetch(IL_PARSER_URL, {
    body: normalizedContent,
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const responseBody = await readResponseTextSafe(response);
    await diagnoseIlParserFailure(normalizedContent);
    const error = new Error(
      `ilparser returned ${response.status} ${response.statusText || ""}`.trim()
    );
    error.ilParserDetails = {
      status: response.status,
      statusText: response.statusText || "",
      responseContentType: response.headers.get("content-type") || "",
      responseBody: truncateForLog(responseBody),
      inputLength: String(content ?? "").length,
      inputHead: truncateForLog(content, 800),
      legacyExternalFlyDbsourceNormalized,
      timeoutMs,
    };
    throw error;
  }
  if (legacyExternalFlyDbsourceNormalized) {
    console.warn("normalized legacy external.fly.ws dbsource before ilparser", {
      ilParserUrl: IL_PARSER_URL,
    });
  }
  return await response.json();
}

function isTargetHotelSearchRequest(request) {
  const headers = request?.request || {};
  const host = String(headers.host || headers.Host || "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
  const rawUrl = String(
    headers.url || headers.rawurl || request?.RawUrl || request?.FullUrl || request?.Url || ""
  );
  const pathname = rawUrl
    .split("?", 1)[0]
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/?/, "/");

  return host === "basis.basiscore.net" && pathname === "/Tem3_Hotel_Search.bc";
}

function traceTargetHotelSearch(stage, request, startedAt, payload = {}) {
  if (!isTargetHotelSearchRequest(request)) {
    return;
  }
  traceRequest(`index1.hotel_search.${stage}`, {
    traceId: getRequestTraceId(request),
    elapsedMs: Date.now() - startedAt,
    ...payload,
  });
}

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
    const startedAt = Date.now();
    const isTargetHotelSearch = isTargetHotelSearchRequest(this._request);
    try {
      traceTargetHotelSearch("start", this._request, startedAt, {
        hasPageIl: !!this._request?.cms?.page_il,
        contentLength: String(this._request?.cms?.content || "").length,
      });
      traceIndex1("start", this._request, startedAt, {
        hasPageIl: !!this._request?.cms?.page_il,
        ilCall: this._request?.cms?.il_call ?? null,
        contentLength: String(this._request?.cms?.content || "").length,
      });
      const encoder = new Encoder("entity");
      if (this._request.cms.page_il == null || this._request.cms.page_il.length == 0) {
        try {
          traceTargetHotelSearch("ilparser.start", this._request, startedAt);
          traceIndex1("ilparser.start", this._request, startedAt, {
            ilParserUrl: IL_PARSER_URL,
            timeoutMs: resolveIlParserTimeoutMs(),
          });
          this._request.cms.page_il = JSON.stringify(
            await parseIlContentAsync(this._request.cms.content)
          );
          traceTargetHotelSearch("ilparser.done", this._request, startedAt, {
            pageIlLength: this._request.cms.page_il.length,
          });
          traceIndex1("ilparser.done", this._request, startedAt, {
            pageIlLength: this._request.cms.page_il.length,
          });
        } catch (error) {
          traceError("index1.ilparser.error", error, {
            traceId: getRequestTraceId(this._request),
            elapsedMs: Date.now() - startedAt,
            ilParserUrl: IL_PARSER_URL,
            timeoutMs: resolveIlParserTimeoutMs(),
          });
          console.error("failed to resolve page_il via ilparser", {
            ilParserUrl: IL_PARSER_URL,
            error: String(error || ""),
            details: error?.ilParserDetails || undefined,
          });
          return [
            502,
            {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
            },
            JSON.stringify({
              error: "ilparser_unavailable",
              ilParserUrl: IL_PARSER_URL,
            }),
          ];
        }
      }
      if (this._request.cms.content) {
        this._request.cms.content = encoder.htmlEncode(
          this._request.cms.content
        );
      }
      let encodedRequest = JSON.parse(JSON.stringify(this._request));

      if (this._request.cms.page_il) {
        encodedRequest.cms.page_il = encoder.htmlEncode(
          this._request.cms.page_il
        );
      }

      /**@type {DebugContext} */
      const requestDebugContext =
        this._request.query?.debug == "true" ||
        this._request.query?.debug == "1"
          ? new RequestDebugContext(
              "logs for request",
              this._request.request["request-id"],
              routingDataStep,
              encodedRequest,
              cms
            )
          : this._request.query?.debug == "2"
          ? new RequestDebugMaxContext(
              "logs for request",
              this._request.request["request-id"],
              routingDataStep,
              this._settings,
              encodedRequest,
              cms
            )
          : new VoidContext("nothing");
      //getIl
      const getIlStep = requestDebugContext.newStep("Get IL");
      let commandIl;
      let command;
      let context;
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
          traceTargetHotelSearch("command.deserialize.start", this._request, startedAt);
          traceIndex1("command.deserialize.start", this._request, startedAt);
          commandIl = JSON.parse(this._request.cms.page_il);
          deserializeJsonStep.complete();
          traceTargetHotelSearch("command.deserialize.done", this._request, startedAt);
          traceIndex1("command.deserialize.done", this._request, startedAt, {
            commandType: commandIl?.$type || "",
          });
        } catch (error) {
          console.log(error);
          deserializeJsonStep.failed();
        }
        context = new RequestContext(
          this._settings,
          this._request,
          this._commands,
          requestDebugContext
        );
        context.cancellation = new CancellationToken();
        command = context.createCommand(commandIl);
        getIlStep.complete();
        traceTargetHotelSearch("command.created", this._request, startedAt, {
          commandType: command?.constructor?.name || "",
        });
        traceIndex1("command.created", this._request, startedAt, {
          commandType: command?.constructor?.name || "",
        });
      } catch (error) {
        console.log(error);
        getIlStep.failed();
      }
      traceTargetHotelSearch("command.execute.start", this._request, startedAt);
      traceIndex1("command.execute.start", this._request, startedAt);
      const result = await command.executeAsync(context);
      traceTargetHotelSearch("command.execute.done", this._request, startedAt, {
        resultType: result?.constructor?.name || "",
      });
      traceIndex1("command.execute.done", this._request, startedAt, {
        resultType: result?.constructor?.name || "",
      });
      const renderResultList = [];
      traceTargetHotelSearch("render.write.start", this._request, startedAt);
      traceIndex1("render.write.start", this._request, startedAt);
      await result.writeAsync(renderResultList, context.cancellation);
      traceTargetHotelSearch("render.write.done", this._request, startedAt, {
        chunkCount: renderResultList.length,
      });
      traceIndex1("render.write.done", this._request, startedAt, {
        chunkCount: renderResultList.length,
      });
      await context.debugContext.writeAsync(
        renderResultList,
        context.cancellation
      );
      let headers = {
        ...{ "content-type": this._request.webserver.mime },
        ...(this._request.webserver.gzip === "true" && {
          "Content-Encoding": "gzip",
        }),
        ...this._request.http,
        ...(context._cookies &&
          Object.fromEntries(
            context._cookies.map((x) => x.toHttpHeaderField())
          )),
      };
      traceTargetHotelSearch("raw_request.write.start", this._request, startedAt);
      await rawRequest?.writeAsync(renderResultList, context.cancellation);
      const renderedHtmlContent = renderResultList.join("");
      traceTargetHotelSearch("html.ready", this._request, startedAt, {
        htmlLength: renderedHtmlContent.length,
      });
      const responseNeedsGzip = this._request.webserver.gzip == "true";
      const saveHtmlPayload = readSaveHtmlPayloadFromRequest(this._request);
      const saveHtmlEnabled = hasSaveHtmlPayload(saveHtmlPayload);

      let gzipContent = null;
      if (responseNeedsGzip || saveHtmlEnabled) {
        try {
          traceTargetHotelSearch("gzip.start", this._request, startedAt, {
            responseNeedsGzip,
            saveHtmlEnabled,
          });
          gzipContent = await gzipAsync(renderedHtmlContent);
          traceTargetHotelSearch("gzip.done", this._request, startedAt, {
            gzipLength: gzipContent.length,
          });
        } catch (gzipError) {
          if (responseNeedsGzip) {
            throw gzipError;
          }
          console.warn("index1 savehtml gzip skipped", {
            requestId: this._request?.request?.["request-id"] || "-",
            error: String(gzipError?.message || gzipError || ""),
          });
        }
      }

      if (saveHtmlEnabled && Buffer.isBuffer(gzipContent)) {
        traceTargetHotelSearch("savehtml.start", this._request, startedAt);
        await persistSaveHtmlToDisk({
          rawSaveHtml: saveHtmlPayload,
          htmlContent: renderedHtmlContent,
          gzipContent,
          traceId: String(this._request?.request?.["request-id"] || "-"),
        });
        traceTargetHotelSearch("savehtml.done", this._request, startedAt);
      }

      traceTargetHotelSearch("done", this._request, startedAt, {
        statusCode: parseInt(this._request.webserver.headercode.split(" ")[0]),
      });
      traceIndex1("done", this._request, startedAt, {
        statusCode: parseInt(this._request.webserver.headercode.split(" ")[0]),
        responseLength: renderedHtmlContent.length,
        gzip: responseNeedsGzip,
      });
      return [
        parseInt(this._request.webserver.headercode.split(" ")[0]),
        headers
        ,
        responseNeedsGzip ? gzipContent : renderedHtmlContent,
      ];
    } catch (ex) {
      if (isTargetHotelSearch) {
        traceError("index1.hotel_search.error", ex, {
          traceId: getRequestTraceId(this._request),
          elapsedMs: Date.now() - startedAt,
        });
      }
      traceError("index1.error", ex, {
        traceId: getRequestTraceId(this._request),
        elapsedMs: Date.now() - startedAt,
      });
      console.error(ex);
      return [
        500,
        {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "no-store",
        },
        JSON.stringify({
          error: "internal_server_error",
          message: String(ex?.message || ex || ""),
        }),
      ];
    }
  }
}
