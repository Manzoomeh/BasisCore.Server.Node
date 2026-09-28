import fs from "fs";
import path from "path";
import IRoutingRequest from "./IRoutingRequest.js";
import Response from "./Response.js";

export default class RequestBaseResponse extends Response {
  /**@type {IRoutingRequest} request */
  _request;
  /** @type {ServiceSettings}  setting*/
  _settings;
  /**
   * @param {IRoutingRequest} request
   */
  /** @param {ServiceSettings} settings*/

  constructor(request, settings) {
    super();
    this._request = request;
    this._settings = settings;
  }

  /**
   * Normalize filesystem paths that may have been stored with Windows
   * separators while the server is running on Linux.
   *
   * @param {string} rawPath
   * @returns {string}
   */
  _normalizeFilesystemPath(rawPath) {
    const value = String(rawPath || "").trim();
    if (!value) {
      return "";
    }
    return path.normalize(value.replace(/[\\/]+/g, path.sep));
  }

  /**
   * Prefer an existing path when Routing has sent a legacy Windows-style
   * value, otherwise return the normalized path for a subsequent write.
   *
   * @param {string} rawPath
   * @param {{includeZipFallback?: boolean}} options
   * @returns {{path: string, originalPath: string, tried: string[], exists: boolean}}
   */
  _resolveFilesystemPath(rawPath, options = {}) {
    const originalPath = String(rawPath || "").trim();
    const candidates = [
      originalPath,
      originalPath.replace(/\\/g, "/"),
      path.normalize(originalPath.replace(/\\/g, "/")),
      this._normalizeFilesystemPath(originalPath),
    ].filter(Boolean);
    if (options.includeZipFallback && originalPath.toLowerCase().endsWith(".zip")) {
      candidates.push(
        originalPath.slice(0, -4),
        originalPath.replace(/\\/g, "/").slice(0, -4),
      );
    }

    const tried = [...new Set(candidates)];
    const existingPath = tried.find((candidate) => fs.existsSync(candidate));

    return {
      path: existingPath || this._normalizeFilesystemPath(originalPath),
      originalPath,
      tried,
      exists: Boolean(existingPath),
    };
  }
}
