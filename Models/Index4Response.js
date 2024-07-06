import fs from "fs";
import { StatusCodes } from "http-status-codes";
import RequestBaseResponse from "./requestBaseResponse.js";
import im from "imagemagick";
import path from "path";
import Pako from "pako";
import Util from "../Util.js";
import WebServerException from "./Exceptions/WebServerException.js";

export default class Index4Response extends RequestBaseResponse {
  /**
   * @param {IRoutingRequest} request
   */
  constructor(request, setting) {
    super(request, setting);
  }
  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  async getResultAsync() {
    /** @type {boolean} */
    const gzip = this._request.webserver.gzip.toLowerCase() === "true";
    /** @type {string} */
    const sourcePath = this._request.index4.source;
    /** @type {string} */
    const destinationPath = this._request.index4.destination;
    let finalPath = destinationPath;
    const lastModifiedDate = new Date(this._request.webserver.lastmodified);
    const fileLastModifiedDate = fs.existsSync(destinationPath)
      ? this._getLastModifiedDate(destinationPath)
      : null;
    if (
      fileLastModifiedDate == null ||
      lastModifiedDate > fileLastModifiedDate
    ) {
      /** @type {string} */
      const size = this._request.index4.size;
      /** @type {IIndex4Property} */
      const setting = JSON.parse(this._request.index4.properties);
      const content = await fs.promises.readFile(sourcePath);
      const newContent = await Index4Response._resizeImageAsync(
        content,
        size,
        setting.deform
      );
      await fs.promises.writeFile(destinationPath, newContent);
      finalPath = destinationPath;
      if (gzip) {
        /** @type {string} */
        let zipPath = this._request.index4.zippath;
        const zipPathDirectory = path.dirname(zipPath);
        zipPath = path.join(
          zipPathDirectory,
          "compressed",
          path.basename(zipPath)
        );
        finalPath = zipPath;
        Index4Response._createDirectoryIfNotExist(zipPath);
        const zipContent = Index4Response._makeGzip(newContent, 9);
        await fs.promises.writeFile(zipPath, zipContent);
      }
      /**@type {string} */
      const webpPath = this._request.index4.webppath;
      if (!Util.isNullOrEmpty(webpPath)) {
        Index4Response._createDirectoryIfNotExist(webpPath);
        const webpContent = await Index4Response._mackWebpAsync(newContent, 90);
        await fs.promises.writeFile(webpPath, webpContent);
      }
    }

    if (fs.existsSync(finalPath)) {
      const finalContent = await fs.promises.readFile(finalPath);
      return [
        parseInt(this._request.webserver.headercode.split(" ")[0]),
        {
          ...{ "content-type": this._request.webserver.mime },
          ...(gzip && {
            "Content-Encoding": "gzip",
          }),
          ...(this._request.webserver.etag && {
            ETag: this._request.webserver.etag,
          }),
          ...(this._request.webserver.lastmodified && {
            "Last-Modified": this._request.webserver.lastmodified,
          }),
          ...(this._request.http && this._request.http),
        },
        finalContent,
      ];
    } else {
      return [StatusCodes.NOT_FOUND, {}, null];
    }
  }
  /**
   *
   * @param {string} filepath
   * @returns {Date}
   */
  _getLastModifiedDate(filepath) {
    const stats = fs.statSync(filepath);
    return stats.mtime;
  }

  /**
   * @param {Buffer} content
   * @param {string} size
   * @param {boolean} deform
   * @returns {Promise<Buffer>}
   */
  static _resizeImageAsync(content, size, deform) {
    return new Promise((resolve) => {
      var op = ["-", "-resize", `${size}${deform ? "!" : ""}`, "-"];
      const process = im.convert(op, function (err, stdout) {
        if (err) {
          throw new WebServerException("Error in resize index 4 image", err);
        }
        try {
          content = Buffer.from(stdout, "binary");
        } catch (err) {
          throw new WebServerException("Error in resize index 4 image", err);
        }
        resolve(content);
      });
      process.stdin.end(content);
    });
  }

  /**
   * @param {Buffer} content
   * @param {number} quality
   * @returns {Promise<Buffer>}
   */
  static _mackWebpAsync(content, quality) {
    return new Promise((resolve) => {
      var op = [
        "-",
        "-quality",
        `${quality}`,
        "-define",
        "webp:lossless=true",
        "-",
      ];
      const process = im.convert(op, function (err, stdout) {
        if (err) {
          throw new WebServerException("Error in create webp image", err);
        }
        try {
          content = Buffer.from(stdout, "binary");
        } catch (err) {
          throw new WebServerException("Error in create webp image", err);
        }
        resolve(content);
      });
      process.stdin.end(content);
    });
  }

  /**
   * @param {string} filePath
   */
  static _createDirectoryIfNotExist(filePath) {
    const pathDirectory = path.dirname(filePath);
    if (!fs.existsSync(pathDirectory)) {
      fs.mkdirSync(pathDirectory);
    }
  }

  /**
   * @param {Buffer} content
   * @param {number} level
   * @returns {Promise<Buffer>}
   */
  static _makeGzip(content, level) {
    try {
      const result = Pako.gzip(content, { level: level });
      return Buffer.from(result.buffer);
    } catch (err) {
      throw new WebServerException("Error in create gzip file", err);
    }
  }
}

class IIndex4Property {
  /** @type {boolean} */
  deform;
}
