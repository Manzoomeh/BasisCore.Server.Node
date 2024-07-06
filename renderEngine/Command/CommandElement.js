import Util from "../../Util.js";
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
    if (rawContent.IsNotNull) {
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
   * @param {string} value
   * @returns {CommandElement}
   */
  addAttributeIfExist(name, value) {
    if (value != null) {
      this.attributes[name] = value;
    }
    return this;
  }

  /**
   * @param {string} name
   * @param {IToken} token
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async addAttributeIfExistAsync(name, token, context) {
    if (token && token.IsNotNull) {
      this.attributes[name] = await token.getValueAsync(context);
    }
    return this;
  }

  /**
   * @returns {string}
   */
  getHtml() {
    try {
      let retVal = `<${this.name} `.concat(
        ...Object.entries(this.attributes).map(
          (pair) =>
            `${pair[0]}=\'${Util.toString(pair[1]).replaceAll("'", '"')}\' `
        ),
        ">"
      );
      retVal = retVal.concat(...this.childs.map((x) => x.getHtml()));
      retVal += `</${this.name}>`;
      return retVal;
    } catch (ex) {
      console.error(ex);
    }
  }
}
