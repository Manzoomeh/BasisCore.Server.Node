import BinaryContent from "../Models/BinaryContent.js";

export default class IProcess {
  /**
   * @param {BinaryContent[]} contents
   * @returns {Promise<BinaryContent[]>}
   */
  processAsync(contents) {
    throw new Error("processAsync not implemented!");
  }
}
