import fs from "fs";
import path from "path";
import HostService from "./hostService.js";
import FileResponse from "../Models/FileResponse.js";
import StringResponse from "../Models/StringResponse.js";

const FILE_SERVING_DISABLED = ["1", "true", "on", "yes"].includes(
  String(process.env.WEBSERVER_DISABLE_INTERNAL_FILE_SERVING || "").toLowerCase()
);

function isOutside(rootPath, filePath) {
  const relative = path.relative(rootPath, filePath);
  return relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
}

export default class StaticFileProxyHostService extends HostService {
  #rootPath;

  constructor(name, rootPath, options) {
    super(name, options);
    this.#rootPath = path.resolve(rootPath);
  }

  async processAsync(request, fileContents) {
    if (FILE_SERVING_DISABLED) {
      return new StringResponse("Not Found", { "cache-control": "no-store" }, 404);
    }

    await this._processUploadAsync(fileContents, request);

    let url;
    try {
      url = decodeURIComponent(String(request?.Url || "").split("?", 1)[0]).replace(/\\/g, "/");
    } catch (_) {
      return new StringResponse("Bad Request", { "cache-control": "no-store" }, 400);
    }

    let rootPath;
    try {
      rootPath = fs.realpathSync(this.#rootPath);
    } catch (_) {
      return new StringResponse("Not Found", { "cache-control": "no-store" }, 404);
    }

    let filePath = path.resolve(rootPath, url.replace(/^\/+/, "") || "index.html");
    if (isOutside(rootPath, filePath)) {
      return new StringResponse("Not Found", { "cache-control": "no-store" }, 404);
    }

    try {
      if (fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      filePath = fs.realpathSync(filePath);
      if (isOutside(rootPath, filePath)) {
        return new StringResponse("Not Found", { "cache-control": "no-store" }, 404);
      }
    } catch (_) {
      // FileResponse returns a 404 for missing files.
    }

    return new FileResponse(filePath, { "cache-control": "no-store" }, request?.request || {});
  }
}
