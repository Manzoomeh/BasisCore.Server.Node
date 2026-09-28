const SERVED_BY_HEADER = "X-Served-By";

function getServedByValue() {
  return String(
    process.env.CMS_RESPONSE_SERVED_BY ||
      process.env.WEBSERVER_RESPONSE_SERVED_BY ||
      ""
  ).trim();
}

function hasHeader(headers, headerName) {
  const normalizedName = String(headerName || "").toLowerCase();
  return Object.keys(headers || {}).some(
    (name) => String(name).toLowerCase() === normalizedName
  );
}

export function withCommonResponseHeaders(headers = {}) {
  const responseHeaders = { ...(headers || {}) };
  const servedBy = getServedByValue();
  if (servedBy && !hasHeader(responseHeaders, SERVED_BY_HEADER)) {
    responseHeaders[SERVED_BY_HEADER] = servedBy;
  }
  return responseHeaders;
}

export function applyCommonResponseHeaders(res) {
  const servedBy = getServedByValue();
  if (!servedBy || !res || typeof res.setHeader !== "function") {
    return;
  }
  if (typeof res.hasHeader === "function" && res.hasHeader(SERVED_BY_HEADER)) {
    return;
  }
  res.setHeader(SERVED_BY_HEADER, servedBy);
}
