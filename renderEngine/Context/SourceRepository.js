import IDataSource from "../Source/IDataSource.js";
import SourceEventManager from "./SourceEventManager.js";

export default class SourceRepository {
  /** @type {Map<string,IDataSource>} */
  sources = new Map();
  /** @type {Map<string,SourceEventManager>} */
  eventManager = new Map();

  /**
   * @param {string} sourceId
   * @returns {IDataSource?}
   */
  tryToGet(sourceId) {
    return this.sources.get(sourceId?.toLowerCase()) ?? null;
  }

  /**
   * @param {string} sourceId
   * @returns {Promise<IDataSource>}
   */
  waitToGetAsync(sourceId) {
    /** @type {Promise<IDataSource>} */
    let retVal;
    const source = this.tryToGet(sourceId);
    if (source) {
      retVal = Promise.resolve(source);
    } else {
      retVal = new Promise((resolve) => {
        sourceId = sourceId?.toLowerCase();
        /** @type {SourceEventHandler} */
        const handler = (source) => {
          this.removeHandler(sourceId, handler);
          resolve(source);
        };
        this.addHandler(sourceId, handler);
        //console.log(`wait for ${sourceId}`);
      });
    }
    return retVal;
  }

  /**
   * @param {IDataSource} source
   * @param {boolean} preview
   */
  addSource(source, preview) {
    this.sources.set(source.id, source);
    if (preview) {
      //todo
      //this.logger.logSource(source);
    }
    //console.log(`${source.id} Added...`);
    this.eventManager.get(source.id)?.trigger(source);
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
      //console.log(`handler Added for ${key}...`);
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
        //console.log(`handler removed for ${key}...`);
      }
    }
  }
}
