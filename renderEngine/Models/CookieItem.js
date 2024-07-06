import Util from "../../Util.js";

export default class CookieItem {
  /** @type {string} */
  name;
  /** @type {string} */
  value;
  /** @type {string} */
  maxAge;
  /** @type {string} */
  path;
  /** @type {boolean} */
  isSecure;

  constructor(name, value, maxAge, path, isSecure) {
    this.name = name;
    this.value = value;
    this.maxAge = maxAge;
    this.path = path;
    this.isSecure = isSecure;
  }

  /**
   * @returns {Array<string>}
   */
  toHttpHeaderField() {
    return [
      "Set-Cookie",
      `${this.name}=${this.value}${
        Util.isNullOrEmpty(this.maxAge) ? "" : `;max-age=${this.maxAge}`
      }${Util.isNullOrEmpty(this.path) ? "" : `;path=${this.path}`}${
        this.isSecure ? ";SameSite=None; Secure" : ""
      }`,
    ];
  }
}
