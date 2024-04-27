import InMemoryMember from "./InMemoryMember.js";
import JsonSource from "../../../Source/JsonSource.js";
/**
 * @typedef {Object} JsonMemberOutPut
 * @property {number} Id
 * @property {number|null} ParentId
 * @property {string|null} Field
 * @property {string} Value
 * @property {"Object"|"Scalar.Numeric"| "Scalar.Boolean"|"Scalar.String"|"Array"|"Scalar.Null"} Type
 * @property {string} Path
 */

class JsonMember extends InMemoryMember {
  /**
   * @param {object} memberIL
   */
  constructor(memberIL) {
    super(memberIL);
  }
  /**
   * @param {IContext} context
   * @returns {Promise<IDataSource>}
   */
  async _parseDataAsync(context) {
    const content = await this.rawContent.getValueAsync(context);
    const parsedJson = JSON.parse(content);
    return new JsonSource(
      this.convertObjectToJsonMemberOutPut(parsedJson),
      this.name
    );
  }
  /**
   *
   * @param {object} obj
   * @param {number|null} parentId
   * @param {number} id
   * @param {string} address
   * @returns {JsonMemberOutPut[]}
   */
  convertObjectToJsonMemberOutPut(obj, parentId = 0, id = 1, address = "") {
    /** @type {JsonMemberOutPut[]} */
    const retVal = [];
    if (Array.isArray(obj)) {
      obj.forEach((element, index) => {
        const result = this.processElementOrProperty(
          index,
          element,
          parentId == 0 ? 0 : parentId + 1,
          id,
          address,
          true
        );
        retVal.push(...result);
        if (result.length > 0) {
          id = result[result.length - 1].Id + 1;
        }
      });
    } else if (obj) {
      for (let propertyKey of Object.keys(obj)) {
        let propertyValue = obj[propertyKey];
        console.log(parentId);
        const result = this.processElementOrProperty(
          propertyKey,
          propertyValue,
          parentId == null ? 0 : parentId + 1,
          id,
          address,
          false
        );
        retVal.push(...result);
        if (result.length > 0) {
          id = result[result.length - 1].Id + 1;
        }
      }
    }
    console.log(retVal);
    return retVal;
  }
  /**
   *
   * @param {string|null} key
   * @param {*} value
   * @param {number} parentId
   * @param {number} id
   * @param {string} address
   * @param {boolean}
   * @returns {JsonMemberOutPut[]}
   */
  processElementOrProperty(key, value, parentId, id, address, isArrayElement) {
    /**
     * @type {JsonMemberOutPut[]}
     */
    let retVal = [];
    let jsType = typeof value;
    let path =
      isArrayElement == true ? address + `[${key}]` : address + "." + key;
    let type;
    let resultKey = isArrayElement ? null : key;
    let isHaveChild = jsType && jsType == "object";
    if (jsType == "object") {
      type = !value ? "Scalar.Null" : Array.isArray(value) ? "Array" : "Object";
    } else {
      type =
        jsType == "string"
          ? "Scalar.String"
          : jsType == "boolean"
          ? "Scalar.Boolean"
          : jsType == "number"
          ? "Scalar.Numeric"
          : "";
    }
    retVal.push({
      Id: id,
      ParentId: parentId == 0 ? null : parentId,
      Field: resultKey,
      Value: value,
      Path: path,
      Type: type,
    });
    if (isHaveChild) {
      const result = this.convertObjectToJsonMemberOutPut(
        value,
        id - 1,
        id + 1,
        path
      );
      retVal.push(...result);
    }
    return retVal;
  }
}
export default JsonMember;
