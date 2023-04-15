export default class LoggerItem {
  /** @type {string} */
  title;
  /** @type {string} */
  value;

  /**
   *
   * @param {string} title
   * @param {string} value
   */
  constructor(title, value) {
    this.title = title;
    this.value = value;
  }

  toString() {
    return `${this.title} ${this.value}`;
  }
}
