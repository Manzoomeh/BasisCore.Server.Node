export default class Util {
  /**
   * @param {*} value
   * @returns {string}
   */
  static toString(value) {
    return (value ?? "").toString();
  }

  /**
   * @param {string} value
   * @returns {boolean}
   */
  static isNullOrEmpty(value) {
    return value == null || value.length == 0;
  }
}
