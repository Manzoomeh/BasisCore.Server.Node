import DataSourceTypes from "../Enums/DataSourceTypes.js";
import IDataSource from "./IDataSource.js";

export default class JsonSource extends IDataSource {
  /**
   *
   * @param {Array<any>} data
   * @param {string} id
   */
  constructor(data, id) {
    super();
    this.data = data;
    this.type = DataSourceTypes.Json;
    this.id = id.toLowerCase();
  }
}
