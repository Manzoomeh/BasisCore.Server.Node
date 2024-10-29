import { createRequire } from "module";
const require = createRequire(import.meta.url);
const alasql = require("./alasql/alasql.fs.cjs");
alasql.fn.REVERSE = function (str) {
  return str ? str.split("").reverse().join("") : null;
};
alasql.fn.CHARINDEX = function (substring, string) {
  return string ? string.indexOf(substring) + 1 : -1;
};
alasql.fn.SUBSTR = function (str, start, length) {
  if (typeof str !== "string") return null;
  start = start - 1;
  if (length !== undefined) {
    return str.substring(start, start + length);
  }
  return str.substring(start);
};
alasql.fn.INDEXOF = function (str, searchValue) {
  if (typeof str !== "string" || typeof searchValue !== "string") return -1;
  var index = str ? str.indexOf(searchValue) : -1;
  return index >= 0 ? index + 1 : -1;
};
export default alasql;
