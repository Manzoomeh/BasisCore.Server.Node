import http from "http";
import https from "https";
import HostService from "./hostService.js";
import StringResponse from "../Models/StringResponse.js";
import {
  traceRequest,
  traceError,
  getRequestTraceId,
  resolveClientIp,
} from "../modules/requestTrace.js";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const INTERNAL_REQUEST_HEADERS = new Set([
  ":authority",
  ":method",
  ":path",
  ":scheme",
  "body",
  "clientip",
  "full-url",
  "hostip",
  "hostport",
  "json",
  "methode",
  "rawurl",
  "request-id",
  "url",
]);

const VALID_HEADER_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function trimTrailingSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

export default class HttpProxyHostService extends HostService {
  #baseUrl;
  #timeoutMs;
  #maxResponseSize;

  constructor(name, options) {
    super(name, options);
    this.#baseUrl = trimTrailingSlash(options?.Settings?.BaseUrl);
    if (!this.#baseUrl) {
      throw new Error(`The 'BaseUrl' setting is required for proxy service '${name}'.`);
    }

    const parsedBaseUrl = new URL(this.#baseUrl);
    if (!new Set(["http:", "https:"]).has(parsedBaseUrl.protocol)) {
      throw new Error(
        `Unsupported proxy protocol '${parsedBaseUrl.protocol}' in service '${name}'.`
      );
    }

    this.#timeoutMs = parsePositiveInteger(
      options?.Settings?.TimeoutMs ?? options?.ProcessTimeout,
      120000
    );
    this.#maxResponseSize = parsePositiveInteger(
      options?.Settings?.MaxResponseSize ?? options?.MaxBodySize,
      500000000
    );
  }

  async initializeAsync() {
    // Proxy services do not load render commands or Edge connections.
  }

  async processAsync(request, fileContents) {
    const traceId = getRequestTraceId(request);
    const rawUrl = String(request?.request?.rawurl || request?.Url || "").replace(
      /^\/+/,
      ""
    );
    const targetUrl = new URL(rawUrl || "", `${this.#baseUrl}/`);
    const method = String(request?.request?.methode || "GET").toUpperCase();

    if (fileContents?.length > 0) {
      return this.#errorResponse(
        501,
        "multipart_proxy_not_supported",
        "Multipart requests cannot be forwarded after upload parsing."
      );
    }

    const body = this.#resolveBody(method, request?.request?.body);
    const headers = this.#buildRequestHeaders(request, targetUrl, body);
    const startedAt = Date.now();

    traceRequest("service.proxy.start", {
      traceId,
      service: this.name,
      method,
      url: request?.FullUrl || request?.Url || "",
      target: targetUrl.toString(),
      timeoutMs: this.#timeoutMs,
    });

    try {
      const response = await this.#sendRequest(targetUrl, method, headers, body);
      traceRequest("service.proxy.done", {
        traceId,
        service: this.name,
        target: targetUrl.toString(),
        statusCode: response.statusCode,
        responseBytes: response.body.length,
        elapsedMs: Date.now() - startedAt,
      });
      return new StringResponse(
        response.body,
        response.headers,
        response.statusCode
      );
    } catch (error) {
      traceError("service.proxy.error", error, {
        traceId,
        service: this.name,
        target: targetUrl.toString(),
        elapsedMs: Date.now() - startedAt,
      });
      return this.#errorResponse(
        502,
        "proxy_upstream_unavailable",
        String(error?.message || error || "")
      );
    }
  }

  #resolveBody(method, body) {
    if (["GET", "HEAD"].includes(method) || body == null || body === "") {
      return null;
    }
    return Buffer.isBuffer(body) ? body : Buffer.from(String(body), "utf8");
  }

  #buildRequestHeaders(request, targetUrl, body) {
    const source = request?.request || {};
    const headers = {};

    Object.entries(source).forEach(([rawName, rawValue]) => {
      const name = String(rawName || "").trim().toLowerCase();
      if (
        !name ||
        !VALID_HEADER_NAME.test(name) ||
        HOP_BY_HOP_HEADERS.has(name) ||
        INTERNAL_REQUEST_HEADERS.has(name) ||
        name === "host" ||
        name === "content-length" ||
        rawValue == null ||
        typeof rawValue === "object"
      ) {
        return;
      }
      headers[name] = Array.isArray(rawValue)
        ? rawValue.map((value) => String(value))
        : String(rawValue);
    });

    const originalHost = String(source.host || "").trim();
    const clientIp = resolveClientIp(request);
    const existingForwardedFor = String(source["x-forwarded-for"] || "").trim();

    headers.host = targetUrl.host;
    if (originalHost) {
      headers["x-forwarded-host"] = originalHost;
    }
    headers["x-forwarded-proto"] = request?.isSecure ? "https" : "http";
    if (clientIp) {
      headers["x-forwarded-for"] = existingForwardedFor
        ? `${existingForwardedFor}, ${clientIp}`
        : clientIp;
    }
    if (body) {
      headers["content-length"] = String(body.length);
    }

    return headers;
  }

  #sendRequest(targetUrl, method, headers, body) {
    const transport = targetUrl.protocol === "https:" ? https : http;

    return new Promise((resolve, reject) => {
      const upstreamRequest = transport.request(
        targetUrl,
        {
          method,
          headers,
        },
        (upstreamResponse) => {
          const chunks = [];
          let totalBytes = 0;

          upstreamResponse.on("data", (chunk) => {
            totalBytes += chunk.length;
            if (totalBytes > this.#maxResponseSize) {
              upstreamResponse.destroy(
                new Error(
                  `Proxy response exceeds ${this.#maxResponseSize} bytes.`
                )
              );
              return;
            }
            chunks.push(chunk);
          });
          upstreamResponse.on("end", () => {
            resolve({
              statusCode: upstreamResponse.statusCode || 502,
              headers: this.#buildResponseHeaders(upstreamResponse),
              body: Buffer.concat(chunks),
            });
          });
          upstreamResponse.on("error", reject);
        }
      );

      upstreamRequest.setTimeout(this.#timeoutMs, () => {
        upstreamRequest.destroy(
          new Error(`Proxy timeout after ${this.#timeoutMs}ms.`)
        );
      });
      upstreamRequest.on("error", reject);
      if (body) {
        upstreamRequest.write(body);
      }
      upstreamRequest.end();
    });
  }

  #buildResponseHeaders(response) {
    const headers = {};
    for (let index = 0; index < response.rawHeaders.length; index += 2) {
      const name = String(response.rawHeaders[index] || "").toLowerCase();
      const value = String(response.rawHeaders[index + 1] || "");
      if (!name || HOP_BY_HOP_HEADERS.has(name)) {
        continue;
      }
      if (headers[name] === undefined) {
        headers[name] = value;
      } else if (Array.isArray(headers[name])) {
        headers[name].push(value);
      } else {
        headers[name] = [headers[name], value];
      }
    }
    return headers;
  }

  #errorResponse(statusCode, error, message) {
    return new StringResponse(
      Buffer.from(JSON.stringify({ error, message }), "utf8"),
      {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
      statusCode
    );
  }
}
