import InMemoryMember from "./InMemoryMember.js";
import JsonSource from "../../../Source/JsonSource.js";
import BasisCoreException from "../../../../Models/Exceptions/BasisCoreException.js";
import IContext from "../../../Context/IContext.js";
export default class JoinMember extends InMemoryMember {
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
    try {
      const leftTable = await context.waitToGetSourceAsync(
        this.leftDataMemberName
      );
      const rightTable = await context.waitToGetSourceAsync(
        this.rightDataMemberName
      );
      if (
        leftTable &&
        rightTable &&
        this.leftTableColumn &&
        this.rightTableColumn &&
        this.joinType
      ) {
        /** */
        let resultArray;
        switch (this.joinType) {
          case "InnerJoin":
            resultArray = this.innerJoin(
              leftTable.data,
              rightTable.data,
              this.leftTableColumn,
              this.rightTableColumn,
              this.leftDataMemberName,
              this.rightDataMemberName
            );
            break;
          case "LeftJoin":
            resultArray = this.leftJoin(
              leftTable.data,
              rightTable.data,
              this.leftTableColumn,
              this.rightTableColumn,
              this.leftDataMemberName,
              this.rightDataMemberName
            );
            break;
          case "RightJoin":
            resultArray = this.rightJoin(
              leftTable.data,
              rightTable.data,
              this.leftTableColumn,
              this.rightTableColumn,
              this.leftDataMemberName,
              this.rightDataMemberName
            );
            break;
          default:
            return new BasisCoreException(
              `Invalid Join Type : ${this.joinType} is not valid join types; valid join types are : [InnerJoin,"LeftJoin","RightJoin","FullJoin"]`
            );
        }
        return new JsonSource(resultArray, this.name);
      } else {
        return new BasisCoreException(
          `fields not provided for joining ${this.leftDataMemberName} and ${this.rightDataMemberName}`
        );
      }
    } catch (error) {
      return new BasisCoreException(
        `error in join ${this.leftDataMemberName} and ${this.rightDataMemberName} :`,
        error
      );
    }
  }
  /**
   * @param {Array} leftArray
   * @param {Array} rightArray
   * @param {string} fieldInLeftTable
   * @param {string} fieldInRightTable
   * @returns Array
   */
  leftJoin(
    leftArray,
    rightArray,
    fieldInLeftTable,
    fieldInRightTable,
    leftDataMemberName,
    rightDataMemberName
  ) {
    return leftArray.map((item1) => {
      const matchingItems = rightArray.filter(
        (item2) => item1[fieldInLeftTable] === item2[fieldInRightTable]
      );
      //remove rowNumber in each array
      return {
        ...this.addPrefixToObjectProperties(item1, leftDataMemberName),
        ...this.addPrefixToObjectProperties(
          matchingItems[0],
          rightDataMemberName
        ),
      };
    });
  }
  /**
   *
   * @param {Array} leftArray
   * @param {Array} rightArray
   * @param {string} fieldInLeftTable
   * @param {string} fieldInRightTable
   * @returns Array
   */
  rightJoin(
    leftArray,
    rightArray,
    fieldInLeftTable,
    fieldInRightTable,
    leftDataMemberName,
    rightDataMemberName
  ) {
    return rightArray.map((item2) => {
      const matchingItem = leftArray.find(
        (item1) => item1[fieldInLeftTable] === item2[fieldInRightTable]
      );
      return {
        ...this.addPrefixToObjectProperties(item2, rightDataMemberName),
        ...this.addPrefixToObjectProperties(matchingItem, leftDataMemberName),
      };
    });
  }
  /**
   * @param {Array} leftArray
   * @param {Array} rightArray
   * @param {string} fieldInLeftTable
   * @param {string} fieldInRightTable
   * @returns Array
   */
  innerJoin(
    leftArray,
    rightArray,
    fieldInLeftTable,
    fieldInRightTable,
    leftDataMemberName,
    rightDataMemberName
  ) {
    return leftArray.flatMap((item1) => {
      const matchingItems = rightArray.filter(
        (item2) => item1[fieldInLeftTable] === item2[fieldInRightTable]
      );
      return matchingItems.map((item2) => ({
        ...this.addPrefixToObjectProperties(item2, rightDataMemberName),
        ...this.addPrefixToObjectProperties(item1, leftDataMemberName),
      }));
    });
  }
  /**
   * @param {object} obj
   * @param {string} prefix
   * @returns
   */
  addPrefixToObjectProperties(obj, prefix) {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[`${prefix}.${key}`] = obj[key];
      }
    }
    return newObj;
  }
}
