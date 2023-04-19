import CertificateOptions from "./certificateOptions.js";
export default class SslCertificateOptions extends CertificateOptions {
  /**@type {string?} */
  FilePath;
  /**@type {string?} */
  KeyPath;
  /**@type {string?} */
  PfxPath;
  /**@type {string?} */
  PfxPassword;
}
