import BinaryContent from "../Models/BinaryContent.js";
import Status from "../Models/Status.js";
import IStep from "./IStep.js";

export default class Step extends IStep {
  /**
   * @param {BinaryContent[]} contents
   * @param {any} options
   * @returns {Promise<BinaryContent[]>}
   */
  async processAsync(contents, options) {
    const tasks = contents.map(async (content) => {
      let retVal = content;
      try {
        retVal = await this.processContentAsync(content, options);
      } catch (er) {
        console.error(er);
        retVal.AddLog("step-error", er);
        retVal.status = Status.StepError;
      }
      return retVal;
    });
    return await Promise.all(tasks);
  }

  /**
   * @param {BinaryContent} content
   * @param {any} options
   * @returns {Promise<BinaryContent>}
   */
  processContentAsync(content, options) {}
}
