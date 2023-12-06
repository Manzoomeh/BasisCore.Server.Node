import BasisCoreException from "../../models/Exceptions/BasisCoreException.js";
export default class FunctionRepository {
  /** @type {Map<Function>} */
  functions = new Map();
  /**
   * @param {string} key
   * @param {any[]} rest
   * @returns any[]
   */
  executeFunction(key, ...rest) {
    const userFunction = this.functions.get(key);
    if (!userFunction) {
      throw new BasisCoreException(`function ${key} is not defined`);
    }
    const retVal = userFunction(...rest);
    return retVal;
  }
  /**
   *
   * @param {string} key
   * @param {Function} userFunction
   * @returns void
   */
  addFunction(key, userFunction) {
    this.functions.set(key, userFunction);
  }
}
