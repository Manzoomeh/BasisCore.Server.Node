export default class StringUtil {
  static formatValue(value) {
    if (!value || typeof value !== "object") {
      return value ?? "";
    }
    if (Array.isArray(value)) {
      // Structured values rendered through @value must remain valid JSON.
      // Joining object arrays drops the surrounding brackets, which breaks
      // consumers such as passenger-form's data-output attribute.
      if (
        value.length === 0 ||
        value.some((item) => item !== null && typeof item === "object")
      ) {
        return JSON.stringify(value);
      }
      return value.map((item) => StringUtil.formatValue(item)).join(",");
    }
    const key = ["title", "name", "value", "id"].find((item) =>
      Object.prototype.hasOwnProperty.call(value, item)
    );
    if (key) {
      return value[key] ?? "";
    }
    return JSON.stringify(value);
  }

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
      str = str.replace(
        new RegExp("\\{" + index + "\\}", "gi"),
        StringUtil.formatValue(data)
      );
    });
    return str;
  }
}
