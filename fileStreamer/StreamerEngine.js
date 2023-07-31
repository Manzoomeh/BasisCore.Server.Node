import fs from "fs";
import got from "got";
import querystring from "querystring";
import BinaryContent from "./Models/BinaryContent.js";
import IPermission from "./Models/IPermission.js";
import IStepOptions from "./Models/IStepOptions.js";
import IStreamOptions from "./Models/IStreamOptions.js";
import IStreamerActions from "./Models/IStreamerActions.js";
import Status from "./Models/Status.js";
import IStreamerEngineOptions from "../models/options/IStreamerEngineOptions.js";
import CompositeProcess from "./Process/CompositeProcess.js";
import InvalidProcessType from "./Process/InvalidProcessType.js";
import IProcess from "./Process/IProcess.js";
import NotExistProcess from "./Process/NotExistProcess.js";
import SimpleProcess from "./Process/SimpleProcess.js";
import Gzip from "./Steps/Gzip/Gzip.js";
import IStep from "./Steps/IStep.js";
import Rename from "./Steps/Rename/Rename.js";
import Resize from "./Steps/Resize/Resize.js";
import Save from "./Steps/Save/Save.js";
import Selector from "./Steps/Selector/Selector.js";
import Edge from "./Steps/Edge/Edge.js";
import WebP from "./Steps/WebP/WebP.js";

export default class StreamerEngine {
  /** @type {IStreamerEngineOptions} */
  _options;
  /**@type {NodeJS.Dict<IStep>} */
  _steps;
  /**@type {IStreamerActions} */
  _defaultConfig = null;

  /** @param {IStreamerEngineOptions} options */
  constructor(options) {
    this._options = options;
    this._steps = {
      gzip: new Gzip(),
      selector: new Selector(),
      save: new Save(),
      rename: new Rename(),
      resize: new Resize(),
      edge: new Edge(),
      webP :new WebP(),
    };
  }

  /**
   * @param {string} path
   * @returns {boolean}
   */
  _isValidUrl(path) {
    try {
      return Boolean(new URL(path));
    } catch {
      return false;
    }
  }

  /**
   * @param {string} url
   * @returns {Promise<string>}
   */
  async _loadOptionsAsync(url) {
    return await new Promise(async (resolve, reject) => {
      if (this._isValidUrl(url)) {
        try {
          resolve(await got.get(url).text());
        } catch (error) {
          reject(error);
        }
      } else {
        try {
          resolve(
            fs.readFileSync(url, {
              encoding: "utf-8",
            })
          );
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * @returns {Promise<void>}
   */
  async _loadDefaultConfigAsync() {
    let tryCount = 0;
    while (tryCount < 5) {
      try {
        const jsonString = await this._loadOptionsAsync(
          this._options.DefaultConfigUrl
        );
        this._defaultConfig = JSON.parse(jsonString);
        break;
      } catch (error) {
        tryCount++;
        const message = `Error in load streamer engine default setting from ${this._options.DefaultConfigUrl}.\n${error}.\ntry again after 1000 ms`;
        console.error(message);
        console.error(error);
        if (tryCount < 5) {
          await new Promise((temp_resolve) => setTimeout(temp_resolve, 1000));
        } else {
          throw new Error(message);
        }
      }
    }
  }

  /**
   * @param {string} queryString
   * @returns {Promise<IStreamOptions>}
   */
  async loadPermissionAsync(queryString) {
    let url = this._options.PermissionUrl;
    if (this._isValidUrl(url) && queryString) {
      url += `?${queryString}`;
    }
    try {
      const jsonString = await this._loadOptionsAsync(url);
      return JSON.parse(jsonString);
    } catch (error) {
      const err = new Error(
        `Error in load streamer engine request permission from ${url}.\n${error}`
      );
      console.error(err);
      console.error(error);
      throw err;
    }
  }

  /**
   *
   * @param {any} report
   * @param {string} queryString
   * @returns {Promise<any>}
   */
  async _sendReportAsync(report, queryString) {
    return await new Promise(async (resolve, reject) => {
      let url = this._options.ReportUrl;
      if (this._isValidUrl(url)) {
        if (queryString) {
          url += `?${queryString}`;
        }
        try {
          const options = {
            json: report,
          };
          resolve(await got.post(url, options).json());
        } catch (error) {
          reject(error);
        }
      } else {
        try {
          fs.writeFileSync(url, JSON.stringify(report, null, 2));
          resolve(report);
        } catch (error) {
          reject(error);
        }
      }
    });
  }

  /**
   * @param {BinaryContent[]} contents
   * @param {string} queryString
   * @returns {Promise<string>}
   */
  async processAsync(contents, queryString) {
    let processResult;
    try {
      if (this._defaultConfig == null) {
        await this._loadDefaultConfigAsync();
      }
      /** @type {IStreamOptions} */
      const permission = await this.loadPermissionAsync(queryString);
      const validContents = this._applyPermission(contents, permission);
      await this._applyProcessAsync(validContents, permission);
      /** @type {BinaryContent[]} */
      const log = [];
      for (const item of contents) {
        this._flatLogs(log, item);
      }

      /**@type {NodeJS.Dict<BinaryContent[]>} */
      const groupByNameContent = log.reduce((previousValue, currentValue) => {
        if (previousValue[currentValue.name]) {
          previousValue[currentValue.name].push(currentValue);
        } else {
          previousValue[currentValue.name] = [currentValue];
        }
        return previousValue;
      }, {});

      for (const key in groupByNameContent) {
        /**@type {BinaryContent[]} */
        const relatedContent = groupByNameContent[key];
        if (relatedContent.length > 0) {
          if (!relatedContent.some((x) => x.processedByChild())) {
            relatedContent[0].status = Status.SuitableProcessNotFound;
          }
        }
      }
      processResult = {
        logs: log
          .filter((x) => x.status != Status.NotSet)
          .map((x) => x.getLogs()),
      };
    } catch (error) {
      console.log(error);
      processResult = { error: error.message };
    }
    let report = {
      queryString: querystring.parse(queryString),
      ...processResult,
    };
    try {
      report = await this._sendReportAsync(report, queryString);
    } catch (error) {
      const message = `Error in send report to ${this._options.ReportUrl}.\n${error}`;
      console.error(message);
      console.error(error);
      report = {
        queryString: querystring.parse(queryString),
        error: message,
      };
    }
    return JSON.stringify(report);
  }

  /**
   * @param {BinaryContent[]} log
   * @param {BinaryContent} binaryContent
   */
  _flatLogs(log, binaryContent) {
    log.push(binaryContent);
    for (const item of binaryContent._children) {
      this._flatLogs(log, item);
    }
  }

  /**
   * @param {BinaryContent[]} contents
   * @param {IStreamOptions} localOptions
   * @returns {BinaryContent[]}
   */
  _applyPermission(contents, localOptions) {
    /** @type {NodeJS.Dict<IPermission>} */
    const permissionList = {};
    if (
      this._defaultConfig !== null &&
      this._defaultConfig.Permissions != null
    ) {
      for (const permission of this._defaultConfig.Permissions) {
        for (const mime of permission.Mimes) {
          permissionList[mime] = permission;
        }
      }
    }
    if (this.localOptions !== null && localOptions.Permissions != null) {
      for (const permission of localOptions.Permissions) {
        for (const mime of permission.Mimes) {
          permissionList[mime] = permission;
        }
      }
    }
    let totalSize = 0;
    for (const content of contents) {
      content.AddLog("name", content.name);
      content.AddLog("size", content.payload.length);
      totalSize += content.payload.length;
    }
    const total = permissionList[""];
    if (total) {
      if (
        (total.MaxSize > 0 && totalSize > total.MaxSize) ||
        (total.MinSize > 0 && totalSize < total.MinSize)
      ) {
        for (const content of contents) {
          content.AddLog("max-valid-total-size", total.MaxSize);
          content.AddLog("min-valid-total-size", total.MinSize);
          content.AddLog("total-size", totalSize);
          content.status = Status.TotalSizeError;
        }
      }
    }

    /**@type {BinaryContent[]} */
    const validContents = [];
    for (const content of contents.filter((x) => x.status == Status.NotSet)) {
      content.AddLog("mime", content.mime);
      //TODO: check mime by extension and content
      const fileExtensionIsMatchByContent = true;
      if (fileExtensionIsMatchByContent) {
        const permission = permissionList[content.mime];
        if (permission) {
          if (permission.MinSize > content.payload.length) {
            content.AddLog("min-valid-size", permission.MinSize);
            content.status = Status.MinSizeError;
          } else if (permission.MaxSize < content.payload.length) {
            content.AddLog("max-valid-size", permission.MaxSize);
            content.status = Status.MaxSizeError;
          }
          validContents.push(content);
        } else {
          content.status = Status.MimeTypePermissionError;
        }
      } else {
        content.status = Status.MimeInjectionError;
      }
    }
    return validContents;
  }

  /**
   * @param {BinaryContent[]} contents
   * @param {IStreamOptions} localOptions
   * @returns {Promise<any>}
   */
  async _applyProcessAsync(contents, localOptions) {
    if (contents.length > 0) {
      /**@type {NodeJS.Dict<IStepOptions>} */
      const actionList = {};
      if (this._defaultConfig && this._defaultConfig.Actions) {
        for (const action of this._defaultConfig.Actions) {
          actionList[action.Name] = action;
        }
      }
      if (localOptions && localOptions.Actions) {
        for (const action of localOptions.Actions) {
          actionList[action.Name] = action;
        }
      }
      const process = this._createProcess(localOptions.Process, actionList);
      await process.processAsync(contents);
    }
  }

  /**
   * @param {any} jsonElement
   * @param {NodeJS.Dict<IStepOptions>} actionList
   * @returns {IProcess}
   */
  _createProcess(jsonElement, actionList) {
    if (Array.isArray(jsonElement)) {
      return new CompositeProcess(
        jsonElement.map((x) => this._createProcess(x, actionList))
      );
    } else if (typeof jsonElement === "string") {
      const stepName = jsonElement.toString();
      const stepOptions = actionList[stepName];
      if (stepOptions) {
        const step = this._steps[stepOptions.Type];
        if (step) {
          return new SimpleProcess(stepName, stepOptions.options, step);
        } else {
          return new InvalidProcessType(action.Type);
        }
      } else {
        return new NotExistProcess(stepName);
      }
    } else {
      return new InvalidProcessType(typeof jsonElement);
    }
  }
}
