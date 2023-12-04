export default class StringUtil {
  /**
   * @param {string?} input
   * @param {string} pattern
   * @param {string} replacement
   * @returns {string}
   */
  static replace(input, pattern, replacement) {
    return input
      ? input.replace(new RegExp(pattern, "gi"), replacement)
      : input;
  }

  /**
   * @param {string} str
   * @param {Array<any>} args
   * @returns {string}
   */
  static format(str, args) {
    args.forEach((data, index) => {
      if(data == null || data == undefined){
        data = ""
      }
      str = str.replace(new RegExp("\\{" + index + "\\}", "gi"), data);
    });
    return str;
  }
}
