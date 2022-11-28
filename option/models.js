import fs from "fs";
import { HostManagerOptions } from "../models/model.js";

// class HostManagerOptions {
//   /**@type {boolean} */
//   Lazy;
//   /**@type {NodeJS.Dict<HostEndPointOptions>} */
//   EndPoints;
//   /**@type {NodeJS.Dict<HostServiceOptions>} */
//   Services;
// }

// class HostEndPointOptions {
//   /**@type {"http" | "webSocket"} */
//   Type;
//   /**@type {PortListenerOptions[]} */
//   Addresses;
//   /**@type {number} */
//   MaxHeaderSize;
//   /**@type {boolean} */
//   Active;
//   /**@type {} */
//   Routing;
//   /** @type {number} */
//   ReadHeaderTimeOut;
// }

// //const HostEndPointType = "http" | "webSocket";

// class HostServiceOptions {}

// class PortListenerOptions {
//   /**@type {string} */
//   EndPoint;
//   /**@type {CertificateOptions} */
//   Certificate;
//   /**@type {number} */
//   ConnectionIdleTime;
// }

// class CertificateOptions {
//   /**@type {boolean} */
//   IgnoreValidationError;
//   /**@type {boolean} */
//   Http2;
//   /**@type {boolean} */
//   http11;
//   /**@type {string} */
//   AbsolutPath;
//   /**@type {number} */
//   ReadTimeout;
// }

// class SslCertificateOptions extends CertificateOptions {
//   /**@type {string} */
//   FilePath;
//   /**@type {string} */
//   KeyFilePath;
//   /**@type {string} */
//   Password;
// }

// class SniCertificateOptions extends CertificateOptions {
//   /**@type {HostCertificateOptions[]} */
//   Hosts;
// }

// class HostCertificateOptions {
//   /**@type {string[]} */
//   HostNames;
//   /**@type {string} */
//   FilePath;
//   /**@type {string} */
//   Password;
//   /**@type {string} */
//   KeyFilePath;
// }

const str = fs.readFileSync("./option/host.json", { encoding: "utf-8" });
const jsonObj = JSON.parse(str);
const host = new HostManagerOptions();
Object.assign(host, jsonObj);
console.log(host.EndPoints["Main002"].Addresses[0].EndPoint);
