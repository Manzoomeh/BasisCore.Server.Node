import path from "path";
import fs from "fs";
import SaveOptions from "./SaveOptions.js";
import BinaryContent from "../../Models/BinaryContent.js";
import Status from "../../Models/Status.js";
import Step from "../Step.js";

export default class Save extends Step {
  /**
   * Normalizes incoming save location from upstream services.
   * - Converts backslashes to Linux-friendly slash separators.
   * - Fixes malformed `/bfiles` prefix to `/b/files`.
   * @param {string} location
   * @returns {string}
   */
  _normalizeLocation(location) {
    if (typeof location !== "string") {
      return "";
    }

    let normalized = location.trim().replace(/\\/g, "/");

    // Map UNC-like storage paths to local mounted storage inside container.
    // Example: //192.168.96.2/b/files/... -> /b/files/...
    normalized = normalized.replace(/^\/\/[^/]+\/bfiles(\/|$)/i, "/b/files$1");
    normalized = normalized.replace(/^\/\/[^/]+\/b(\/|$)/i, "/b$1");

    // Fallback for already-collapsed UNC prefix (e.g. /192.168.96.2/b/...)
    normalized = normalized.replace(
      /^\/(?:\d{1,3}\.){3}\d{1,3}\/bfiles(\/|$)/i,
      "/b/files$1"
    );
    normalized = normalized.replace(
      /^\/(?:\d{1,3}\.){3}\d{1,3}\/b(\/|$)/i,
      "/b$1"
    );

    normalized = normalized.replace(/^\/bfiles(\/|$)/i, "/b/files$1");
    normalized = normalized.replace(/^bfiles(\/|$)/i, "b/files$1");
    normalized = normalized.replace(/\/{2,}/g, "/");

    return normalized;
  }

  /**
   * @param {BinaryContent} content
   * @param {SaveOptions} options
   * @returns {Promise<BinaryContent>}
   */
  processContentAsync(content, options) {
    try {
      const saveLocation = this._normalizeLocation(options.location);
      if (!saveLocation) {
        throw new Error("save location is empty");
      }
      if (!fs.existsSync(saveLocation)) {
        fs.mkdirSync(saveLocation, { recursive: true });
      }
      const filePath = path.join(saveLocation, content.name);
      fs.writeFileSync(filePath, content.payload);
      console.log("[upload-save] saved", filePath);
      content.AddLog("save", filePath);
      content.status = Status.Successful;
    } catch (er) {
      console.error("[upload-save] failed", {
        location: options?.location || "",
        normalizedLocation: this._normalizeLocation(options?.location || ""),
        name: content?.name || "",
        error: er?.message || String(er),
      });
      content.AddLog("save-error", er);
      content.status = Status.StepError;
    }
    return Promise.resolve(content);
  }
}
