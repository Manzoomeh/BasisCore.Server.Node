export default class StringBuilder {
  /**@type {string} */
  _string = "";
  /**@param {string} inputString */
  append(inputString) {
    this._string += inputString;
  }
  toString() {
    return this._string;
  }
}
