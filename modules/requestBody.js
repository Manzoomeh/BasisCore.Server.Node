import querystring from "querystring";
import ObjectUtil from "./objectUtil.js";

const UNSAFE_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isSafeLegacyPath(name) {
  return String(name)
    .split(".")
    .filter(Boolean)
    .every((part) => !UNSAFE_KEYS.has(part.split("__", 1)[0]));
}

/**
 * Legacy hotel forms submit nested values as flat field names such as
 * `_root.rooms__1.adultcount`. Keep those original fields, but also expose
 * the nested `_root` object expected by tokens such as cms.form._root.
 *
 * @param {NodeJS.Dict<any>} formFields
 * @returns {NodeJS.Dict<any>}
 */
export function enrichLegacyFormFields(formFields) {
  if (!formFields || typeof formFields !== "object" || Array.isArray(formFields)) {
    return formFields;
  }

  const legacyRootFields = Object.create(null);
  for (const [name, value] of Object.entries(formFields)) {
    if (name.startsWith("_root.") && isSafeLegacyPath(name)) {
      legacyRootFields[name] = value;
    }
  }

  if (Object.keys(legacyRootFields).length === 0) {
    return formFields;
  }

  const nested = JSON.parse(
    ObjectUtil.convertObjectToNestedStructure(legacyRootFields)
  );
  if (nested?._root && typeof nested._root === "object") {
    formFields._root = nested._root;
  }

  return formFields;
}

/**
 * Returns the JSON value expected in cms.json.header. `_root` is a form-path
 * marker and must not be included in the resulting payload.
 *
 * @param {NodeJS.Dict<any>} formFields
 * @returns {string|null}
 */
export function getLegacyJsonHeader(formFields) {
  const enriched = enrichLegacyFormFields(formFields);
  return enriched?._root && typeof enriched._root === "object"
    ? JSON.stringify(enriched._root)
    : null;
}

function getMediaType(contentType) {
  return String(contentType || "")
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
}

function sanitizeJsonValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  const result = Object.create(null);
  for (const [key, item] of Object.entries(value)) {
    if (!UNSAFE_KEYS.has(key)) {
      result[key] = sanitizeJsonValue(item);
    }
  }
  return result;
}

export function shouldCollectRequestBody(contentType) {
  const mediaType = getMediaType(contentType);
  return (
    mediaType === "application/x-www-form-urlencoded" ||
    mediaType === "application/json" ||
    mediaType.endsWith("+json") ||
    mediaType === "application/javascript" ||
    mediaType === "text/plain"
  );
}

export function parseBodyFormFields(body, contentType) {
  const mediaType = getMediaType(contentType);
  const bodyText = String(body || "");

  if (mediaType === "application/x-www-form-urlencoded") {
    return querystring.parse(bodyText);
  }

  const canContainJson =
    mediaType === "application/json" ||
    mediaType.endsWith("+json") ||
    mediaType === "application/javascript" ||
    mediaType === "text/plain";

  if (!canContainJson || !bodyText.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(bodyText);
    if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
      throw new TypeError("request JSON body must be an object");
    }
    return sanitizeJsonValue(parsed);
  } catch {
    // fetch() sends a string body as text/plain unless the caller supplies a
    // Content-Type header. Legacy pages use URLSearchParams-style strings,
    // so retain their cms.form contract even with that browser default.
    if (mediaType === "text/plain" && bodyText.includes("=")) {
      return querystring.parse(bodyText);
    }
    return null;
  }
}
