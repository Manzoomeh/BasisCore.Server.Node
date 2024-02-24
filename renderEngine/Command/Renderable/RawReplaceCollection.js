import IContext from "../../Context/IContext.js";
import CommandElement from "../CommandElement.js";
import RawReplace from "./RawReplace.js";
import ReplaceCollection from "./ReplaceCollection.js";

export default class RawReplaceCollection {
  /** @type {Array<RawReplace>} */
  items;

  /**
   * @param {object[]?} ilObject
   */
  constructor(ilObject) {
    this.items = ilObject?.map((x) => new RawReplace(x));
  }

  /**
   * @param {IContext} context
   * @returns {Promise<ReplaceCollection>}
   */
  async processAsync(context) {
    /** @type {ReplaceCollection} */
    let retVal = null;
    if (this.items) {
      const tasks = this.items.map((x) =>
        Promise.all([
          x.tagName.getValueAsync(context),
          x.template.getValueAsync(context),
        ])
      );
      const result = await Promise.all(tasks);
      retVal = new ReplaceCollection(Object.fromEntries(result));
    }
    return retVal;
  }

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    return this.items.length > 0;
  }

  /**
   * @param {CommandElement} ownerTag
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async addHtmlElementAsync(ownerTag, context) {
    await Promise.all(
      this.items.map(async (replace) => {
        ownerTag.addChild(await replace.createHtmlElementAsync(context));
      })
    );
  }
}
