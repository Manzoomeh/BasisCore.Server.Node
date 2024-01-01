export default class Util {
  /**
   * @param {*} value
   * @returns {string}
   */
  static toString(value) {
    return (value ?? "").toString();
  }

  /**
   * @param {Window} window
   * @returns {boolean}
   */

  static startFetch(window) {
    !window.fetching ? (window.fetching = 1) : (window.fetching += 1);
  }
  /**
   * @param {Window} window
   * @returns {boolean}
   */

  static endFetch(window) {
    window.fetching = window.fetching - 1;
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
}
