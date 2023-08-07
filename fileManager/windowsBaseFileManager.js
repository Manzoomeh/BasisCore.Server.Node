import fs from "fs";
import FileManagerBase from "./fileManagerBase.js";

 class WindowsBaseFileManager  {
  exists(path) {
    return fs.existsSync(path);
  }

  readFileAsync(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, "utf8", (err, data) => {
        if (err) {
          throw new Error("file does not exist");
        } else {
          resolve(data);
        }
      });
    });
  }

}
export default WindowsBaseFileManager
