import IContext from "../../Context/IContext.js";
import RawReplace from "./RawReplace.js";
import ReplaceCollection from "./ReplaceCollection.js";

export default class RawReplaceCollection {
  /** @type {Array<RawReplace>} */
  items;

  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    this.items = ilObject.map((x) => new RawReplace(x));
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ReplaceCollection>}
   */
  async processAsync(context) {
    const tasks = this.items.map((x) =>
      Promise.all([
        x.tagName.getValueAsync(context),
        x.template.getValueAsync(context),
      ])
    );
    const result = await Promise.all(tasks);
    return new ReplaceCollection(Object.fromEntries(result));
  }
}
