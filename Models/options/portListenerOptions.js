import SslCertificateOptions from "./sslCertificateOptions.js";
import SniCertificateOptions from "./SniCertificateOptions.js";
export default class PortListenerOptions {
  /**@type {string} */
  EndPoint;
  /**@type {SslCertificateOptions|SniCertificateOptions} */
  Certificate;
  /**@type {number} */
  ConnectionIdleTime;
}
