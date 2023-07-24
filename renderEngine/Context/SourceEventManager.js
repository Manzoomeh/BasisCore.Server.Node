import IDataSource from "../Source/IDataSource";

/**
 * @callback SourceEventHandler
 * @param {IDataSource} responseCode
 */
export default class SourceEventManager {
  /** @type {Set<SourceEventHandler>} */
  handlers;

  /**
   * @param {SourceEventHandler} handler
   * @returns {boolean}
   */
  tryAdd(handler) {
    let retVal = false;
    if (typeof handler !== "function") {
      throw new Error("handler null or is not function!");
    }
    if (!this.handlers.has(handler)) {
      this.handlers.add(handler);
      retVal = true;
    }
    return retVal;
  }

  /**
   * @param {SourceEventHandler} handler
   * @returns {boolean}
   */
  tryRemove(handler) {
    return this.handlers.delete(handler);
  }

  /**
   * @param {IDataSource} source
   */
  trigger(source) {
    this.handlers.forEach((handler) => {
      try {
        handler(source);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
