import path from "path"
let windowsPath = "\\web75\\b\\files\\reference\\3compressed\\basiscore.basispanel.component-1.3.1.js.zip";
const normalizedPath = windowsPath.replace(/\\/g, "/"); // Replace backslashes with forward slashes
const splitPath = normalizedPath.split("/");
const linuxPath = path.posix.join("/", ...splitPath);
console.log("linuxPath : " + linuxPath);
