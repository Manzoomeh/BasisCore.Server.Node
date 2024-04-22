import CommandElement from "../../CommandElement.js";
import ParamItem from "./ParamItem.js";

export default class ParamItemCollection {
  /** @type {ParamItem[]} */
  items = [];
  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    if (Array.isArray(ilObject)) {
      ilObject.map((x) => this.items.push(new ParamItem(x)));
    }
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
    const paramsTag = new CommandElement("params");
    await Promise.all(
      this.items.map(async (pair) => {
        const addTag = new CommandElement("add");
        await Promise.all([
          addTag.addAttributeIfExistAsync("name", pair.name, context),
          addTag.addAttributeIfExistAsync("value", pair.value, context),
        ]);
        paramsTag.addChild(addTag);
      })
    );
    ownerTag.addChild(paramsTag);
  }
}
