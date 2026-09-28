import IContext from "../../Context/IContext.js";
import IToken from "../../Token/IToken.js";
import TokenUtil from "../../Token/TokenUtil.js";
import CommandBase from "../CommandBase.js";
import GroupCommand from "../Collection/GroupCommand.js";
import RunTypes from "../../Enums/RunTypes.js";

const MAX_CALL_DEPTH = 30;

function normalizeCallPath(callPath) {
  return Array.isArray(callPath)
    ? callPath.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function normalizePageName(pageName) {
  return String(pageName || "").trim().toLowerCase();
}

function normalizeCallFrames(callFrames) {
  return Array.isArray(callFrames)
    ? callFrames.filter(
        (frame) =>
          frame &&
          typeof frame.pageName === "string" &&
          typeof frame.signature === "string"
      )
    : [];
}

function createCallSignature(pageName, htmlContent) {
  return `${normalizePageName(pageName)}|${String(htmlContent || "")
    .replace(/\s+/g, " ")
    .trim()}`;
}

export default class CallCommand extends CommandBase {
  /** @type {IToken} */
  file;
  /** @type {IToken} */
  pageSize;
  /** @type {number} */
  callDepth;
  /** @type {string[]} */
  callPath;
  /** @type {{pageName: string, signature: string}[]} */
  callFrames;
  /**
   * @param {object} callCommandIl
   */
  constructor(callCommandIl) {
    super(callCommandIl);
    this.file = TokenUtil.getFiled(callCommandIl, "FileName");
    this.pageSize = TokenUtil.getFiled(callCommandIl, "pagesize");
    this.callDepth = 0;
    this.callPath = [];
    this.callFrames = [];
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandBase[]>}
   */
  async callAsync(context) {
    const runType = await this._getRunTypeValueAsync(context);
    const ifValue = await this._getIfValueAsync(context);
    let retVal;

    if (runType.toLowerCase() == RunTypes.AtClient) {
      retVal = [this];
    } else if (!ifValue) {
      retVal = [];
    } else {
      /** @type {CommandBase[]} */
      const [pageName, pageSize, html] = await Promise.all([
        this.file.getValueAsync(context),
        this.pageSize.getValueAsync(context),
        this.createHtmlElementAsync(context),
      ]);

      const parentCallPath = normalizeCallPath(this.callPath);
      const parentCallFrames = normalizeCallFrames(this.callFrames);
      const htmlContent = html.getHtml();
      const callSignature = createCallSignature(pageName, htmlContent);
      const matchingFrameIndexes = parentCallFrames.reduce(
        (indexes, frame, index) => {
          if (frame.signature === callSignature) {
            indexes.push(index);
          }
          return indexes;
        },
        []
      );
      if (normalizePageName(pageName) && matchingFrameIndexes.length > 0) {
        // A recursive include must only stop its own branch. Throwing here is
        // converted to ExceptionResult by CommandBase and corrupts an
        // otherwise valid legacy header/footer render.
        return [];
      }

      if (this.callDepth >= MAX_CALL_DEPTH) {
        return [];
      }

      const callPath = [
        ...parentCallPath,
        String(pageName || "").trim() || "(empty page name)",
      ];
      const callFrames = [
        ...parentCallFrames,
        {
          pageName: String(pageName || "").trim() || "(empty page name)",
          signature: callSignature,
        },
      ];

      context.cancellation.throwIfCancellationRequested();
      context.newStep;
      let command;
      const loadPageStep = context.debugContext.newStep(
        `Load ${pageName} From DB`
      );
      try {
        command = await context.loadPageAsync(
          pageName,
          htmlContent,
          pageSize,
          this.callDepth + 1
        );
        loadPageStep.complete();
      } catch (error) {
        loadPageStep.failed();
        console.error("callAsync loadPageAsync failed", {
          pageName,
          pageSize,
          callDepth: this.callDepth,
          callPath,
          callSignature,
          error: String(error?.message || error || ""),
        });
        throw error;
      }

      if (!command) {
        throw new Error(`call command resolved to empty page command for '${pageName}'`);
      }

      if (command instanceof CallCommand) {
        command.callDepth = this.callDepth + 1;
        command.callPath = callPath;
        command.callFrames = callFrames;
        retVal = await command.callAsync(context);
      } else if (command instanceof GroupCommand) {
        retVal = [];
        for (let i = 0; i < command.commandsObjects?.length; i++) {
          const item = context.createCommand(command.commandsObjects[i]);
          if (item instanceof CallCommand) {
            item.callDepth = this.callDepth + 1;
            item.callPath = callPath;
            item.callFrames = callFrames;
            retVal.push(...(await item.callAsync(context)));
          } else {
            if ("callDepth" in item) {
              item.callDepth = this.callDepth + 1;
            }
            if ("callPath" in item) {
              item.callPath = callPath;
            }
            if ("callFrames" in item) {
              item.callFrames = callFrames;
            }
            retVal.push(item);
          }
        }
      } else {
        if ("callDepth" in command) {
          command.callDepth = this.callDepth + 1;
        }
        if ("callPath" in command) {
          command.callPath = callPath;
        }
        if ("callFrames" in command) {
          command.callFrames = callFrames;
        }
        retVal = [command];
      }
    }
    return retVal;
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    await Promise.all([
      tag.addAttributeIfExistAsync("file", this.file, context),
      tag.addAttributeIfExistAsync("pagesize", this.pageSize, context),
    ]);
    return tag;
  }
}
