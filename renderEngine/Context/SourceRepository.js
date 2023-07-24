import IDataSource from "../Source/IDataSource";
import SourceEventManager from "./SourceEventManager";

export default class SourceRepository {
  /** @type {Map<string,IDataSource>} */
  sources = Map();
  /** @type {Map<string,SourceEventManager>} */
  eventManager = Map();

  /**
   * @param {string} sourceId
   * @returns {IDataSource}
   */
  tryToGet(sourceId) {
    return this.repository.get(sourceId?.toLowerCase());
  }

  /**
   * @param {IDataSource} source
   * @param {boolean} preview
   */
  setSource(source, preview) {
    this.sources.set(source.id);
    if (preview) {
      //todo
      //this.logger.logSource(source);
    }
    this.eventManager.get(source.id)?.trigger(source);
    this.logger.logInformation(`${source.id} Added...`);
  }

  /**
   * @param {string} sourceId
   * @param {import("./SourceEventManager").SourceEventHandler} handler
   */
  addHandler(sourceId, handler) {
    const key = sourceId.toLowerCase();
    let handlers = this.eventManager.get(key);
    if (!handlers) {
      handlers = new SourceEventManager();
      this.eventManager.set(key, handlers);
    }
    if (handlers.tryAdd(handler)) {
      this.logger.logInformation(`handler Added for ${key}...`);
    }
  }

  /**
   * @param {string} sourceId
   * @param {import("./SourceEventManager").SourceEventHandler} handler
   */
  removeHandler(sourceId, handler) {
    const key = sourceId?.toLowerCase();
    let handlers = this.eventManager.get(key);
    if (handlers) {
      if (handlers.tryRemove(handler)) {
        this.logger.logInformation(`handler removed for ${key}...`);
      }
    }
  }

  /**
   * @param {string} sourceId
   * @returns {Promise<IDataSource>}
   */
  waitToGetAsync(sourceId) {
    return new Promise((resolve) => {
      sourceId = sourceId?.toLowerCase();
      //this.logger.logInformation(`wait for ${sourceId}`);
      let handler = this.eventManager.get(sourceId);
      if (!handler) {
        handler = new SourceEventManager();
        this.eventManager.set(sourceId, handler);
      }
      handler.tryAdd(resolve);
    });
  }
}
