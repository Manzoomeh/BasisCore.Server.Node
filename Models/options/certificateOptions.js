export default class CertificateOptions {
  /**@type {boolean} */
  IgnoreValidationError;
  /**@type {"ssl"|"sni"} */
  Type;
  /**@type {boolean} */
  Http2;
  /**@type {boolean} */
  http11;
  /**@type {string} */
  AbsolutPath;
  /**@type {number} */
  ReadTimeout;
}
