import IContext from "../Context/IContext.js";
import IToken from "../Token/IToken.js";
import ElementBase from "./ElementBase.js";
import RawHtmlElement from "./RawHtmlElement.js";

export default class CommandElement extends ElementBase {
  /** @type {string} */
  name;
  /** @type {NodeJS.Dict<string>} */
  attributes;
  /** @type {ElementBase[]} */
  childs;

  /**
   * @param {string} tagName
   */
  constructor(tagName) {
    super();
    this.name = tagName;
    this.attributes = {};
    this.childs = [];
  }

  /**
   * @param {string} rawContent
   * @returns {CommandElement}
   */
  addChildIfExist(rawContent) {
    if (rawContent && rawContent.length > 0) {
      this.childs.push(new RawHtmlElement(rawContent));
    }
    return this;
  }

  /**
   * @param {IToken} rawContent
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async addRawContentIfExistAsync(rawContent, context) {
    if (rawContent) {
      this.addChildIfExist(await rawContent.getValueAsync(context));
    }
    return this;
  }

  /**
   * @param {ElementBase} child
   * @returns {CommandElement}
   */
  addChild(child) {
    this.childs.push(child);
    return this;
  }

  /**
   * @param {string} name
   * @param {IToken|string} value
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async addAttributeIfExistAsync(name, value, context) {
    const k =
      value instanceof IToken ? await value.getValueAsync(context) : value;
    if (k !== null) {
      this.attributes[name] = k;
    }
    return this;
  }

  getHtml() {
    let retVal = `<${this.name} `.concat(
      ...Object.entries(this.attributes).map(
        (pair) => `${pair[0]}=\'${pair[1] ? pair[1].replace("'", '"') : ""}\'`
      ),
      ">"
    );
    retVal = retVal.concat(...this.childs.map((x) => x.getHtml()));
    retVal += `</${this.name}>`;
    return retVal;
  }
}
