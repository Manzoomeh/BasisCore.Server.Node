import path from "path";
import fs from "fs";
import SaveOptions from "./SaveOptions.js";
import BinaryContent from "../../Models/BinaryContent.js";
import Status from "../../Models/Status.js";
import Step from "../Step.js";

export default class Save extends Step {
  /**
   * @param {BinaryContent} content
   * @param {SaveOptions} options
   * @returns {Promise<BinaryContent>}
   */
  processContentAsync(content, options) {
    try {
      if (!fs.existsSync(options.location)) {
        fs.mkdirSync(options.location);
      }
      const filePath = path.join(options.location, content.name);
      fs.writeFileSync(filePath, content.payload);
      content.AddLog("save", filePath);
      content.status = Status.Successful;
    } catch (er) {
      content.AddLog("save-error", er);
      content.status = Status.StepError;
    }
    return Promise.resolve(content);
  }
}
