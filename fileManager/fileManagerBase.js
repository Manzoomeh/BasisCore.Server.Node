import WindowsBaseFileManager from "./windowsBaseFileManager.js";
import LinuxBaseFileManager from "./linuxBaseFileManager.js";

class FileManagerBase {
  /**@type {WindowsBaseFileManager|LinuxBaseFileManager} */
  _current;

  constructor() {
    if (process.platform === "win32") {
      this._current = new WindowsBaseFileManager();
    } else {
      this._current = new LinuxBaseFileManager();
    }
  }

  /**
   * @param {string} path - The file path to check for existence.
   * @returns {boolean} - True if the file exists, false otherwise.
   */
  exists(path) {
    return this._current.exists(path);
  }

  /**
   * @param {string} path - The file path to read asynchronously.
   * @returns {Promise<string>} - A Promise that resolves with the file content as a string.
   */
  readFileAsync(path) {
    return this._current.readFileAsync(path);
  }

  /**
   *
   * @returns {WindowsBaseFileManager|LinuxBaseFileManager}
   */
  static getCurrent() {
   
    const fileManagerBase = new FileManagerBase()
    return fileManagerBase._current;
  }
}

export default FileManagerBase;
