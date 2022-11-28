import CertificateOptions from "./certificateOptions.js";
import HostCertificateOptions from "./hostCertificateOptions.js";
export default class SniCertificateOptions extends CertificateOptions {
  /**@type {HostCertificateOptions[]} */
  Hosts;
}
