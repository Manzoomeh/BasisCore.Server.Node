import InMemoryMember from "./InMemoryMember.js";
import JsonSource from "../../../Source/JsonSource.js";
/**
 * @typedef {Object} JsonMemberOutPut
 * @property {number} RowNumber
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
   * @param {number} rowNumber
   * @param {string} address
   * @returns {JsonMemberOutPut[]}
   */
  convertObjectToJsonMemberOutPut(
    obj,
    parentId = null,
    rowNumber = 1,
    address = ""
  ) {
    /** @type {JsonMemberOutPut[]} */
    const retVal = [];
    if (Array.isArray(obj)) {
      obj.forEach((element, index) => {
        const result = this.processElementOrProperty(
          index,
          element,
          parentId + 1,
          rowNumber,
          address,
          "element"
        );
        retVal.push(...result);
        if (result.length > 0) {
          rowNumber = result[result.length - 1].RowNumber + 1;
        }
      });
    } else if (obj) {
      for (let propertyKey of Object.keys(obj)) {
        let propertyValue = obj[propertyKey];
        const result = this.processElementOrProperty(
          propertyKey,
          propertyValue,
          parentId + 1,
          rowNumber,
          address,
          "property"
        );
        retVal.push(...result);
        if (result.length > 0) {
          rowNumber = result[result.length - 1].RowNumber + 1;
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
   * @param {number} rowNumber
   * @param {string} address
   * @returns {JsonMemberOutPut[]}
   */
  processElementOrProperty(key, value, parentId, rowNumber, address, attrType) {
    /**
     * @type {JsonMemberOutPut[]}
     */
    let retVal = [];
    let type = typeof value;
    let path =
      attrType == "property" ? address + "." + key : address + `[${key}]`;
    switch (type) {
      case "string":
      case "number":
      case "boolean":
        retVal.push({
          RowNumber: rowNumber,
          Id: rowNumber,
          ParentId: parentId,
          Field: key,
          Value: value,
          Path: path,
          Type:
            type == "string"
              ? "Scalar.String"
              : type == "boolean"
              ? "Scalar.Boolean"
              : type == "number"
              ? "Scalar.Numeric"
              : "",
        });
        break;
      case "object":
        if (!value) {
          retVal.push({
            RowNumber: rowNumber,
            Id: rowNumber,
            ParentId: parentId,
            Field: key,
            Value: value,
            Path: path,
            Type: "Scalar.Null",
          });
        } else if (Array.isArray(value)) {
          retVal.push({
            RowNumber: rowNumber,
            Id: rowNumber,
            ParentId: parentId,
            Field: null,
            Value: JSON.stringify(value),
            Path: path,
            Type: "Array",
          });
          const result = this.convertObjectToJsonMemberOutPut(
            value,
            rowNumber - 1,
            rowNumber+1,
            path
          );
          retVal.push(...result);
        } else if (value) {
          retVal.push({
            RowNumber: rowNumber,
            Id: rowNumber,
            ParentId: parentId,
            Field: key,
            Value: JSON.stringify(value),
            Path: path,
            Type: "Object",
          });
          const result = this.convertObjectToJsonMemberOutPut(
            value,
            rowNumber - 1,
            rowNumber+1,
            path
          );
          retVal.push(...result);
        }

        break;
    }
    return retVal;
  }
}
export default JsonMember;
