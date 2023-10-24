import BasisCoreException from "./BasisCoreException.js";

export default class BasisConnectionSourceNotFoundException extends BasisCoreException {
  /**
   * @param {string} source
   */
  constructor(source) {
    super(`Source '${source}' Not Found`);
  }
}
