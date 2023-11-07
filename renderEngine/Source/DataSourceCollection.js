import JsonSource from "./JsonSource.js";

export default class DataSourceCollection {
  /** @type {JsonSource[]} */
  items = [];
  /**
   * @param {Array<Array<object>>} recordSet
   */
  constructor(recordSet) {
    recordSet.forEach((set, index) =>
      this.items.push(new JsonSource(set, index.toString()))
    );
  }
}
