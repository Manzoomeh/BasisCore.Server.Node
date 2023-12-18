import {convertObjectToNestedStructure} from "./modules/objectUtil";
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
