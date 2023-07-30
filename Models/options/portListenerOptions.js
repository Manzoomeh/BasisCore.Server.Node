import SslCertificateOptions from "./sslCertificateOptions.js";
import SniCertificateOptions from "./sniCertificateOptions.js";
export default class PortListenerOptions {
  /**@type {string} */
  EndPoint;
  /**@type {SslCertificateOptions|SniCertificateOptions} */
  Certificate;
  /**@type {number} */
  ConnectionIdleTime;
}
