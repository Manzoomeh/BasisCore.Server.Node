import path from "path";
import RenameOptions from "./RenameOptions.js";
import BinaryContent from "../../Models/BinaryContent.js";
import Step from "../Step.js";

export default class Rename extends Step {
  /**
   * @param {BinaryContent} content
   * @param {RenameOptions} options
   * @returns {Promise<BinaryContent>}
   */
  processContentAsync(content, options) {
    try {
      if (options.FileNameFormat) {
        const newName = this.formatName(options.FileNameFormat, content.name);
        content.name = newName;
        content.AddLog("rename-to", newName);
      }
    } catch (er) {
      content.AddLog(`rename-error-${options.FileNameFormat}-error`, er);
      content.status = Status.StepError;
    }
    return Promise.resolve(content);
  }

  /**
   * @param {string} format
   * @param {string} filename
   * @returns {string}
   */
  formatName(format, filename) {
    const temp = path.parse(filename);
    return format
      .replace("{0}", temp.name)
      .replace("{1}", temp.ext.substring(1));
  }
}
