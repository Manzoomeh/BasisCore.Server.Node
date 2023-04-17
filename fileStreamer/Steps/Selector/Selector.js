import path from "path";
import BinaryContent from "../../Models/BinaryContent.js";
import IStep from "../IStep.js";
import SelectorOptions from "./SelectorOptions.js";

export default class Selector extends IStep {
  /**
   * @param {BinaryContent[]} contents
   * @param {SelectorOptions} options
   * @returns {Promise<BinaryContent[]>}
   */
  async processAsync(contents, options) {
    if (options.extentions) {
      contents = contents.filter((x) =>
        options.extentions.includes(path.extname(x.name).toLowerCase())
      );
    }
    if (options.mimes) {
      contents = contents.filter((x) => options.mimes.includes(x.mime));
    }
    return Promise.resolve(contents);
  }
}
