export default class Response {
  /**
   *  @returns {Promise<[number,NodeJS.Dict<number | string | string[]>,*]>}
   */
  getResultAsync() {
    throw new Error("not implemented");
  }
}
