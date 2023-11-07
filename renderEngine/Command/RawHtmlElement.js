import ElementBase from "./ElementBase.js";

export default class RawHtmlElement extends ElementBase {
  /** @type {string} */
  rawContent;
  /**
   * @param {string} content
   */
  constructor(content) {
    super();
    this.rawContent = content;
  }

  /**
   * @returns {string}
   */
  getHtml() {
    return this.rawContent;
  }
}
