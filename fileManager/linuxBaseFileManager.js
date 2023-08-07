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
      throw new Error("file did not found");
      return false;
    }
  }
  readFileAsync(path) {
    const linuxPath = this.convertToLinuxPath(path);
    return new Promise((resolve, reject) => {
      fs.readFile(linuxPath, "utf8", (err, data) => {
        if (err) {
          throw new Error("file does not exists");
        } else {
          console.log(data);
          resolve(data);
        }
      });
    });
  }
  convertToLinuxPath(windowsPath) {
    console.log("windowsPath: " + windowsPath);
    const normalizedPath = windowsPath.replace(/\\/g, "/"); // Replace backslashes with forward slashes
    const splitPath = normalizedPath.split("/");
    const dynamicPath = process.env.DYNAMIC_PATH || "driveZ";
    // Change the first folder to "driveZ"
    if (splitPath.length > 1) {
      splitPath[0] = dynamicPath;
    }

    const linuxPath = path.posix.join("/", ...splitPath);
    console.log("linuxPath: " + linuxPath);
    return linuxPath;
  }
}
export default LinuxBaseFileManager;
