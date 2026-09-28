import mime from "mime-types";
import fs from "fs";
import path from "path";
import { StatusCodes } from "http-status-codes";
import Response from "./Response.js";

const EXTENSION_CONTENT_TYPE_FALLBACKS = Object.freeze({
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".cjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
});

export default class FileResponse extends Response {
  /** @type {string}*/
  #path;
  /** @type {NodeJS.Dict<string|number|string[]>} */
  #headers;
  /** @type {NodeJS.Dict<string|number|string[]>} */
  #requestHeaders;

  /**
   * @param {string} path
   * @param {NodeJS.Dict<string|number|string[]>} headers
   * @param {NodeJS.Dict<string|number|string[]>} requestHeaders
   */
  constructor(path, headers = {}, requestHeaders = {}) {
    super();
    this.#path = path;
    this.#headers = headers || {};
    this.#requestHeaders = requestHeaders || {};
  }

  /**
   * @returns {string}
   */
  #resolveContentType() {
    const mimeType = mime.lookup(this.#path);
    if (mimeType) {
      return mime.contentType(mimeType) || String(mimeType);
    }
    const extension = path.extname(this.#path || "").toLowerCase();
    return (
      EXTENSION_CONTENT_TYPE_FALLBACKS[extension] ||
      "application/octet-stream"
    );
  }

  /**
   * @param {string} name
   * @returns {string}
   */
  #readRequestHeader(name) {
    const lower = String(name || "").toLowerCase();
    const headers = this.#requestHeaders || {};
    const value =
      headers[name] ??
      headers[lower] ??
      headers[String(name || "").toUpperCase()] ??
      "";
    if (Array.isArray(value)) {
      return String(value[0] || "").trim();
    }
    return String(value || "").trim();
  }

  /**
   * @param {fs.Stats} stats
   * @returns {string}
   */
  #buildWeakEtag(stats) {
    return `W/"${stats.size}-${Math.floor(stats.mtimeMs).toString(16)}"`;
  }

  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync() {
    try {
      const stats = await fs.promises.stat(this.#path);
      if (!stats.isFile()) {
        return [
          StatusCodes.NOT_FOUND,
          {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
          },
          Buffer.from("Not Found", "utf8"),
        ];
      }
      const content = await fs.promises.readFile(this.#path);
      const etag = this.#buildWeakEtag(stats);
      const lastModified = stats.mtime.toUTCString();
      const headers = {
        "content-type": this.#resolveContentType(),
        "content-length": String(content.length),
        etag,
        "last-modified": lastModified,
        ...this.#headers,
      };
      const ifNoneMatch = this.#readRequestHeader("if-none-match");
      const ifModifiedSince = this.#readRequestHeader("if-modified-since");
      if (ifNoneMatch && ifNoneMatch === etag) {
        const notModifiedHeaders = { ...headers };
        delete notModifiedHeaders["content-length"];
        return [StatusCodes.NOT_MODIFIED, notModifiedHeaders, Buffer.alloc(0)];
      }
      if (ifModifiedSince) {
        const sinceTimestamp = Date.parse(ifModifiedSince);
        if (
          Number.isFinite(sinceTimestamp) &&
          Math.floor(stats.mtimeMs) <= Math.floor(sinceTimestamp) + 999
        ) {
          const notModifiedHeaders = { ...headers };
          delete notModifiedHeaders["content-length"];
          return [StatusCodes.NOT_MODIFIED, notModifiedHeaders, Buffer.alloc(0)];
        }
      }
      return [
        StatusCodes.OK,
        headers,
        content,
      ];
    } catch (_) {
      return [
        StatusCodes.NOT_FOUND,
        {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        },
        Buffer.from("Not Found", "utf8"),
      ];
    }
  }
}
