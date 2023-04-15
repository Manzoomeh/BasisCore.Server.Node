import Status from "../Models/Status.js";
import IProcess from "./IProcess.js";
import BinaryContent from "../Models/BinaryContent.js";

export default class CompositeProcess extends IProcess {
  /** @type {IProcess[]} */
  _processList;

  /**
   * @param {IProcess[]} processList
   */
  constructor(processList) {
    super();
    this._processList = processList;
  }

  /**
   * @param {BinaryContent[]} contents
   * @returns {Promise<BinaryContent[]>}
   */
  async processAsync(contents) {
    contents = contents.filter((x) => x.status == Status.NotSet);
    let hasComposite = false;
    if (contents.length > 0) {
      /**@type {Promise<BinaryContent[]>[]} */
      let compositeTaskList = [];
      for (const process of this._processList) {
        if (hasComposite || process instanceof CompositeProcess) {
          hasComposite = true;
          const clonedContent = contents.map((x) => x.clone());
          compositeTaskList.push(process.processAsync(clonedContent));
        } else {
          const resultContents = await process.processAsync(contents);
          contents = resultContents.filter((x) => x.status == Status.NotSet);
          if (contents.length === 0) {
            break;
          }
        }
      }
      await Promise.all(compositeTaskList);
    }
    return hasComposite ? [] : contents;
  }

  toString() {
    return `Composite [\n${this._processList
      .map((x) => x.toString())
      .join("\n")}}`;
  }
}
