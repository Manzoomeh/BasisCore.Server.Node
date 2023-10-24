export default class InvalidConfigException extends Error {
  constructor(configFile, configKey, expectedType) {
    super(
      `In '${configFile}' file, key '${configKey}' not set properly!${
        expectedType ? `(expected type is '${expectedType}')` : ""
      } `
    );
  }
}
