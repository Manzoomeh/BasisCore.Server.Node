export default class SimpleTokenElement {
  /**@type {string} */
  source;
  /**@type {string} */
  member;
  /**@type {string?} */
  column;
  /**@type {string?} */
  value;

  constructor(source, member, column, value) {
    this.source = source;
    this.member = member;
    this.column = column;
    this.value = value;
  }
}
