export default class IDataSource {
  /**@type {DataSourceTypes} */
  type;
  /**@type {Array<any>} */
  data;
  /**@type {string} */
  id;
  /**@type {Array<string>} */
  get columns() {
    return this.data?.length > 0 ? Object.keys(this.data[0]??{}) : [];
  }
}
