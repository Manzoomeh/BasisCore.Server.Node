export default class MysqlRow {
  /**@type {string} */
  type;
  /**@type {string} */
  name;
  /**@type {string} */
  value;
  constructor(type, name, value) {
    this.name = name;
    this.type = type;
    this.value = value;
  }
}
