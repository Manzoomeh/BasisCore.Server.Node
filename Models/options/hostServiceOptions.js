import MultipartOptions from "./MultipartOptions.js";

//const HostEndPointType = "http" | "webSocket";
export default class HostServiceOptions {
  /**@type {"Sql"|"Edge"|"File"} */
  Type;
  /**@type {number} */
  ReadBodyTimeOut;
  /**@type {number} */
  ProcessTimeOut;
  /**@type {number} */
  MaxBodySize;
  /**@type {number} */
  MaxMultiPartSize;
  /**@type {MultipartOptions} */
  Multipart;
  /**@type {NodeJS.Dict<any>} */
  Settings;
}
