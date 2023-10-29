import BasisCoreException from "./BasisCoreException.js";

export default class InvalidConfigException extends BasisCoreException {
  /**
   * @param {string} configFile
   * @param {string} configKey
   * @param {string?} expectedType
   */
  constructor(configFile, configKey, expectedType) {
    super(
      `In '${configFile}' File, Key '${configKey}' Not Properly Set!${
        !expectedType ? `Expected Type is '${expectedType}'.` : ""
      }`
    );
  }
}
