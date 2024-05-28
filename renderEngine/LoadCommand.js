import fs from "fs";
import path from "path";
/**
 * @typedef {Object.<string, any>} Commands
 * @description all commands object values must be classes that inherit to CommandBase
 */
class LoadCommand {
  /**@type {string} */
  commandDir;

  /**@param {string} commandDir */
  constructor(commandDir) {
    this.commandDir = commandDir;
  }

  /** @returns {string[]} */
  getJSFiles() {
    try {
      const files = fs.readdirSync(this.commandDir);
      const jsFiles = files
        .filter((file) => path.extname(file) === ".js")
        .map((file) => {
          return path.parse(file).name;
        });
      return jsFiles;
    } catch (err) {
      throw err;
    }
  }
  /**
   *
   * @param {string} inputPath
   * @returns {string}
   */
  _convertWindowsToLinuxPath(filePath) {
    if (filePath.startsWith("/")) {
      return filePath;
    }
    return filePath.replace(/\\/g, "/").replace(/^[A-Z]:\//, function (match) {
      return "/";
    });
  }
  /**@returns {Promise<Commands>} */
  static async process(libPath) {
    let commands = {};
    if (libPath) {
      const loadCommand = new LoadCommand(libPath);
      const moduleNames = loadCommand.getJSFiles();
      for (let moduleName of moduleNames) {
        const lowerCaseModuleName = moduleName.toLowerCase();
        let modifiedModuleName = lowerCaseModuleName.endsWith("command")
          ? lowerCaseModuleName.slice(0, -7).toLowerCase()
          : lowerCaseModuleName;
        let linuxPath = loadCommand._convertWindowsToLinuxPath(
          loadCommand.commandDir + "/" + moduleName + ".js"
        );
        commands[modifiedModuleName.toLowerCase()] = import(linuxPath);
      }
    }
    return commands;
  }
  /**@returns {Commands} */
  static processSync(libPath) {
    return LoadCommand.process(libPath)
      .then((result) => {
        return result;
      })
      .catch((error) => {
        throw error;
      });
  }
}
export default LoadCommand;
