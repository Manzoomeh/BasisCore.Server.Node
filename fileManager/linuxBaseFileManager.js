import FileManagerBase from "./fileManagerBase.js";
import path from "path";
import fs from "fs";
class LinuxBaseFileManager {
  constructor() {}

  exists(path) {
    const linuxPath = this.convertToLinuxPath(path);
    if (fs.existsSync(linuxPath)) {
      return true;
    } else {
      throw new Error("file did not found  "+ linuxPath );
    }
  }
  readFileAsync(path) {
    const linuxPath = this.convertToLinuxPath(path);
    return new Promise((resolve, reject) => {
      fs.readFile(linuxPath, (err, data) => {
        if (err) {
          throw new Error("file does not exists");
        } else {
          resolve(data);
        }
      });
    });
  }
  convertToLinuxPath(windowsPath) {
    const normalizedPath = windowsPath.replace(/\\/g, "/"); // Replace backslashes with forward slashes
    const splitPath = normalizedPath.split("/");
    const dynamicPath = process.env.DYNAMIC_PATH || "driveZ";
    // Change the first folder to "driveZ"
    if (splitPath.length > 1) {
      splitPath[0] = dynamicPath;
    }

    const linuxPath = path.posix.join("/", ...splitPath);
    return linuxPath;
  }
  
}
export default LinuxBaseFileManager;
