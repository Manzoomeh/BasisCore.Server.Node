import Pako from "pako";
import BinaryContent from "../../Models/BinaryContent.js";
import Status from "../../Models/Status.js";
import Step from "../Step.js";
import GzipOptions from "./GzipOptions.js";

//http://nodeca.github.io/pako/#gzip
//http://zlib.net/manual.html#Advanced

export default class Gzip extends Step {
  /**
   * @param {BinaryContent} content
   * @param {GzipOptions} options
   * @returns {Promise<BinaryContent>}
   */
  processContentAsync(content, options) {
    try {
      /**@type {Pako.DeflateFunctionOptions} */
      const pakoOptions = {
        level: options.Level,
      };
      const result = Pako.gzip(content.payload, pakoOptions);
      content.payload = Buffer.from(result.buffer);
      content.AddLog("gzip-level", options.Level);
    } catch (er) {
      content.AddLog("save-error", er);
      content.status = Status.StepError;
    }
    return Promise.resolve(content);
  }
}
