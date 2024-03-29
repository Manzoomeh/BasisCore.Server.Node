export default class Util {
  /**
   * @param {any} value
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

  /**
   * @param {Array<object>} array
   * @param {string} key
   * @returns {NodeJS.Dict<Array<object>>}
   */
  static groupBy(array, key) {
    return array.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  /**
   * @param {any} value
   * @returns {boolean}
   */
  static isNullOrUndefined(value) {
    return value === undefined || value === null;
  }
}
