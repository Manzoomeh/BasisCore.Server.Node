import fs from "fs";
import path from "path";
import { traceRequest } from "./requestTrace.js";

const WINDOWS_DRIVE_PREFIX = /^[A-Za-z]:\//;
const DEFAULT_ALLOWED_ROOTS = ["/app/b"];

/**
 * @param {unknown} value
 * @returns {string}
 */
function toCleanString(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeSlashes(value) {
  return String(value || "").replace(/\\/g, "/");
}

/**
 * @returns {string[]}
 */
function getAllowedRoots() {
  const raw = toCleanString(process.env.INDEX1_SAVEHTML_ALLOWED_ROOTS);
  const roots = (raw || DEFAULT_ALLOWED_ROOTS.join(","))
    .split(",")
    .map((item) => normalizeSlashes(toCleanString(item)))
    .filter(Boolean)
    .map((item) => path.posix.resolve(item));
  return roots.length > 0 ? roots : [...DEFAULT_ALLOWED_ROOTS];
}

/**
 * @param {string} targetPath
 * @param {string[]} allowedRoots
 * @returns {boolean}
 */
function isPathInAllowedRoots(targetPath, allowedRoots) {
  const absoluteTarget = path.posix.resolve(targetPath);
  return allowedRoots.some((root) => {
    const absoluteRoot = path.posix.resolve(root);
    return (
      absoluteTarget === absoluteRoot ||
      absoluteTarget.startsWith(`${absoluteRoot}/`)
    );
  });
}

/**
 * @param {unknown} rawPath
 * @param {string[]} allowedRoots
 * @returns {string}
 */
function normalizePathFromPayload(rawPath, allowedRoots) {
  let candidate = normalizeSlashes(toCleanString(rawPath));
  if (!candidate) {
    return "";
  }

  const appRootMarker = "/app/b/";
  const lowerCandidate = candidate.toLowerCase();
  const appRootMarkerIndex = lowerCandidate.indexOf(appRootMarker);
  if (appRootMarkerIndex > 0) {
    candidate = candidate.slice(appRootMarkerIndex);
  }

  if (WINDOWS_DRIVE_PREFIX.test(candidate)) {
    candidate = candidate.slice(2);
  }

  if (!candidate.startsWith("/")) {
    candidate = path.posix.resolve(allowedRoots[0], candidate);
  } else {
    candidate = path.posix.resolve(candidate);
  }

  return path.posix.normalize(candidate);
}

/**
 * Router stores compressed cache paths with a `.zip` suffix in sqlite.
 * Keep the on-disk filename aligned with that value.
 *
 * @param {string} filePath
 * @returns {string}
 */
function ensureZipExtension(filePath) {
  const normalized = normalizeSlashes(toCleanString(filePath));
  if (!normalized) {
    return "";
  }
  return normalized.toLowerCase().endsWith(".zip")
    ? normalized
    : `${normalized}.zip`;
}

/**
 * @param {unknown} rawSaveHtml
 * @returns {null|NodeJS.Dict<any>}
 */
function parseSaveHtmlPayload(rawSaveHtml) {
  if (!rawSaveHtml) {
    return null;
  }
  if (typeof rawSaveHtml === "object") {
    return rawSaveHtml;
  }
  if (typeof rawSaveHtml !== "string") {
    return null;
  }
  const rawText = toCleanString(rawSaveHtml);
  if (!rawText) {
    return null;
  }
  try {
    return JSON.parse(rawText);
  } catch (_) {
    return null;
  }
}

/**
 * @param {unknown} rawSaveHtml
 * @returns {boolean}
 */
export function hasSaveHtmlPayload(rawSaveHtml) {
  return !!parseSaveHtmlPayload(rawSaveHtml);
}

/**
 * @param {unknown} routingRequest
 * @returns {unknown}
 */
export function readSaveHtmlPayloadFromRequest(routingRequest) {
  const fromWebserver = routingRequest?.webserver?.savehtml;
  if (
    fromWebserver != null &&
    !(typeof fromWebserver === "string" && !toCleanString(fromWebserver))
  ) {
    return fromWebserver;
  }
  const fromCmsWebserver = routingRequest?.cms?.webserver?.savehtml;
  if (
    fromCmsWebserver != null &&
    !(typeof fromCmsWebserver === "string" && !toCleanString(fromCmsWebserver))
  ) {
    return fromCmsWebserver;
  }
  return null;
}

/**
 * @param {string} sourcePath
 * @param {string} archivePath
 * @returns {Promise<void>}
 */
async function archiveIfExists(sourcePath, archivePath) {
  if (!archivePath) {
    return;
  }
  try {
    await fs.promises.access(sourcePath, fs.constants.F_OK);
  } catch (_) {
    return;
  }

  await fs.promises.mkdir(path.posix.dirname(archivePath), { recursive: true });
  await fs.promises.rm(archivePath, { force: true });
  try {
    await fs.promises.rename(sourcePath, archivePath);
  } catch (error) {
    if (error?.code === "EXDEV") {
      await fs.promises.copyFile(sourcePath, archivePath);
      await fs.promises.unlink(sourcePath);
      return;
    }
    throw error;
  }
}

/**
 * @param {string} targetPath
 * @param {Buffer|string} content
 * @returns {Promise<void>}
 */
async function writeFileAtomic(targetPath, content) {
  const dirPath = path.posix.dirname(targetPath);
  await fs.promises.mkdir(dirPath, { recursive: true });

  const tempPath = path.posix.join(
    dirPath,
    `.${path.posix.basename(targetPath)}.tmp-${process.pid}-${Date.now()}`
  );
  await fs.promises.writeFile(tempPath, content);
  try {
    await fs.promises.rename(tempPath, targetPath);
  } catch (error) {
    if (error?.code === "EXDEV") {
      await fs.promises.copyFile(tempPath, targetPath);
      await fs.promises.unlink(tempPath);
      return;
    }
    await fs.promises.rm(tempPath, { force: true });
    throw error;
  }
}

/**
 * @param {Object} args
 * @param {unknown} args.rawSaveHtml
 * @param {string} args.htmlContent
 * @param {Buffer} args.gzipContent
 * @param {string} args.traceId
 * @returns {Promise<void>}
 */
export async function persistSaveHtmlToDisk({
  rawSaveHtml,
  htmlContent,
  gzipContent,
  traceId = "-",
}) {
  const allowedRoots = getAllowedRoots();
  const payload = parseSaveHtmlPayload(rawSaveHtml);
  if (!payload || typeof payload !== "object") {
    return;
  }

  const normalizedName = path.posix.basename(
    normalizeSlashes(toCleanString(payload.name))
  );
  if (!normalizedName) {
    traceRequest(
      "index1.savehtml.skip",
      {
        traceId,
        reason: "invalid_name",
      },
      "warn"
    );
    return;
  }

  const basePath = normalizePathFromPayload(payload.path, allowedRoots);
  if (!basePath || !isPathInAllowedRoots(basePath, allowedRoots)) {
    traceRequest(
      "index1.savehtml.skip",
      {
        traceId,
        reason: "invalid_path",
        path: String(payload.path || ""),
      },
      "warn"
    );
    return;
  }

  const targetMainPath = path.posix.join(basePath, normalizedName);
  const targetCompressedPath = ensureZipExtension(
    path.posix.join(basePath, "compressed", normalizedName)
  );

  let archiveMainPath = "";
  let archiveCompressedPath = "";
  if (payload.archive && typeof payload.archive === "object") {
    const normalizedArchiveMain = normalizePathFromPayload(
      payload.archive.main,
      allowedRoots
    );
    if (
      normalizedArchiveMain &&
      isPathInAllowedRoots(normalizedArchiveMain, allowedRoots)
    ) {
      archiveMainPath = normalizedArchiveMain;
    }

    const normalizedArchiveCompressed = ensureZipExtension(
      normalizePathFromPayload(payload.archive.compressed, allowedRoots)
    );
    if (
      normalizedArchiveCompressed &&
      isPathInAllowedRoots(normalizedArchiveCompressed, allowedRoots)
    ) {
      archiveCompressedPath = normalizedArchiveCompressed;
    }
  }

  try {
    await archiveIfExists(targetMainPath, archiveMainPath);
    await archiveIfExists(targetCompressedPath, archiveCompressedPath);

    await writeFileAtomic(targetMainPath, htmlContent);
    await writeFileAtomic(targetCompressedPath, gzipContent);

    traceRequest("index1.savehtml.write", {
      traceId,
      mainPath: targetMainPath,
      compressedPath: targetCompressedPath,
      hasArchiveMain: !!archiveMainPath,
      hasArchiveCompressed: !!archiveCompressedPath,
    });
  } catch (error) {
    traceRequest(
      "index1.savehtml.error",
      {
        traceId,
        error: String(error?.message || error || ""),
      },
      "warn"
    );
  }
}
