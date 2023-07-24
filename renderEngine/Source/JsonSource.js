import DataSourceTypes from "../Enums/DataSourceTypes";
import IDataSource from "./IDataSource";

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
    this.columns = data ? Object.keys(this.data[0]) : [];
  }
}
