export default class Param {
  /**
   * @type {string}
   */
  type;
    /**
   * @type {string}
   */
  name;
  /**
   * @type {string}
   */
  value;

  constructor(type,name,value){
    this.name = name;
    this.type = type;
    this.value = value
  }
}