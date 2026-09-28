const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);
const TRACE_HEADER_ALLOWLIST = new Set([
  "host",
  "origin",
  "referer",
  "user-agent",
  "x-forwarded-for",
  "x-forwarded-proto",
  "x-forwarded-host",
  "cf-ray",
  "cf-connecting-ip",
  "cf-ipcountry",
  "content-type",
  "content-length",
  "accept",
  "accept-language",
]);
const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization",
]);

function toBool(value, fallback = false) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (!normalized) {
    return fallback;
  }
  return TRUE_VALUES.has(normalized);
}

function shouldTrace() {
  return toBool(process.env.REQUEST_TRACE_ENABLED, false);
}

function includeAllHeaders() {
  return toBool(process.env.REQUEST_TRACE_INCLUDE_HEADERS, false);
}

function truncate(value, max = 300) {
  const str = String(value ?? "");
  if (str.length <= max) {
    return str;
  }
  return `${str.slice(0, max)}...(+${str.length - max})`;
}

function normalizeHeaderValue(value) {
  if (Array.isArray(value)) {
    return truncate(value.join(", "), 500);
  }
  return truncate(value, 500);
}

function normalizeIp(ip) {
  const raw = String(ip || "").trim();
  if (!raw) {
    return "";
  }
  const first = raw.split(",")[0].trim();
  if (!first) {
    return "";
  }
  return first.startsWith("::ffff:") ? first.slice(7) : first;
}

function readHeader(headers, name) {
  if (!headers) {
    return "";
  }
  const value = headers[name] ?? headers[String(name || "").toLowerCase()] ?? "";
  return Array.isArray(value) ? String(value[0] || "").trim() : String(value || "").trim();
}

export function getForwardedFor(requestLike) {
  const headers = requestLike?.request || requestLike?.headers || {};
  return normalizeHeaderValue(readHeader(headers, "x-forwarded-for"));
}

export function resolveClientIp(requestLike) {
  const headers = requestLike?.request || requestLike?.headers || {};
  const socket = requestLike?.socket || requestLike?.request?.socket;
  const xForwardedFor = readHeader(headers, "x-forwarded-for");
  const candidates = [
    readHeader(headers, "cf-connecting-ip"),
    readHeader(headers, "true-client-ip"),
    readHeader(headers, "x-real-ip"),
    xForwardedFor.split(",")[0] || "",
    readHeader(headers, "clientip"),
    requestLike?.remoteAddress || "",
    socket?.remoteAddress || "",
  ];
  for (const candidate of candidates) {
    const ip = normalizeIp(candidate);
    if (ip) {
      return ip;
    }
  }
  return "";
}

function sanitizeHeaders(headers) {
  const source = headers || {};
  const includeRaw = includeAllHeaders();
  /** @type {NodeJS.Dict<string>} */
  const result = {};
  Object.keys(source).forEach((keyRaw) => {
    const key = String(keyRaw || "").toLowerCase().trim();
    if (!key) {
      return;
    }
    if (!includeRaw && !TRACE_HEADER_ALLOWLIST.has(key)) {
      return;
    }
    if (SENSITIVE_HEADERS.has(key)) {
      result[key] = "[redacted]";
      return;
    }
    result[key] = normalizeHeaderValue(source[keyRaw]);
  });
  return result;
}

export function getRequestTraceId(requestLike) {
  const reqHeaders = requestLike?.request || requestLike?.headers || {};
  return (
    reqHeaders["request-id"] ||
    reqHeaders["x-request-id"] ||
    reqHeaders["cf-ray"] ||
    "-"
  );
}

export function traceRequest(event, payload = {}, level = "log") {
  if (!shouldTrace()) {
    return;
  }
  const logger =
    level === "error"
      ? console.error
      : level === "warn"
      ? console.warn
      : console.log;
  const entry = {
    ts: new Date().toISOString(),
    event,
    ...payload,
  };
  try {
    logger(`[trace] ${JSON.stringify(entry)}`);
  } catch (error) {
    logger("[trace]", event, payload);
  }
}

export function traceIncomingHttpRequest(req, protocol = "http1") {
  const headers = req?.headers || {};
  const clientIp = resolveClientIp({ headers, socket: req?.socket });
  const forwardedFor = getForwardedFor({ headers });
  traceRequest("request.received", {
    protocol,
    method: req?.method || "",
    url: req?.url || "",
    httpVersion: req?.httpVersion || "",
    host: headers.host || headers[":authority"] || "",
    clientIp,
    forwardedFor,
    remoteAddress: req?.socket?.remoteAddress || "",
    remotePort: req?.socket?.remotePort || "",
    headers: sanitizeHeaders(headers),
  });
}

export function traceIncomingHttp2Stream(headers) {
  const headerBag = headers || {};
  const clientIp = resolveClientIp({ headers: headerBag });
  const forwardedFor = getForwardedFor({ headers: headerBag });
  traceRequest("request.received", {
    protocol: "http2",
    method: headerBag[":method"] || "",
    url: headerBag[":path"] || "",
    httpVersion: "2.0",
    host: headerBag[":authority"] || "",
    clientIp,
    forwardedFor,
    headers: sanitizeHeaders(headerBag),
  });
}

export function traceError(event, error, payload = {}) {
  const message = String(error?.message || error || "");
  const code = String(error?.code || "");
  traceRequest(
    event,
    {
      ...payload,
      error: truncate(message, 1000),
      code,
    },
    "error"
  );
}
