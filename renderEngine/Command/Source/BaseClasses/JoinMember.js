import InMemoryMember from "./InMemoryMember.js";
import JsonSource from "../../../Source/JsonSource.js";
import BasisCoreException from "../../../../Models/Exceptions/BasisCoreException.js";
import IContext from "../../../Context/IContext.js";
import IToken from "../../../Token/IToken.js";
import alasql from "alasql";
export default class JoinMember extends InMemoryMember {
  /**
   * @param {object} memberIL
   */
  /**@type {IToken} */
  leftTableColumn;
  /**@type {IToken} */
  rightTableColumn;
  /**@type {IToken} */
  joinType;
  constructor(memberIL) {
    super(memberIL);
    this.leftTableColumn = TokenUtil.getFiled(commandIL, "left-data-member");
    this.rightTableColumn = TokenUtil.getFiled(commandIL, "right-data-member");
    this.joinType = TokenUtil.getFiled(commandIL, "jointype");
  }
  /**
   * @param {IContext} context
   * @returns {Promise<IDataSource>}
   */
  async _parseDataAsync(context) {
    try {
      const [leftDataMemberName, leftTableColumn] =
        await this.splitDataMemberNameAndColumnName(this.leftTableColumn);
      const [rightDataMemberName, rightTableColumn] =
        await this.splitDataMemberNameAndColumnName(this.rightTableColumn);
      const [leftTable, rightTable] = await Promise.all([
        context.waitToGetSourceAsync(leftDataMemberName),
        context.waitToGetSourceAsync(rightDataMemberName),
      ]);
      if (
        leftTable &&
        rightTable &&
        this.leftTableColumn &&
        this.rightTableColumn &&
        this.joinType
      ) {
        /** */
        let resultArray;
        const db = new alasql.Database();
        switch (await this.joinType.getValueAsync()) {
          case "InnerJoin":
            resultArray = await this.innerJoin(
              this.deleteRowNumberFromArrayAndModifyFieldName(
                leftTable.data,
                leftDataMemberName
              ),
              this.deleteRowNumberFromArrayAndModifyFieldName(
                rightTable.data,
                rightDataMemberName
              ),
              leftTableColumn,
              rightTableColumn,
              leftDataMemberName,
              rightDataMemberName,
              db
            );
            break;
          case "LeftJoin":
            resultArray = await this.leftJoin(
              this.deleteRowNumberFromArrayAndModifyFieldName(
                leftTable.data,
                leftDataMemberName
              ),
              this.deleteRowNumberFromArrayAndModifyFieldName(
                rightTable.data,
                rightDataMemberName
              ),
              leftTableColumn,
              rightTableColumn,
              leftDataMemberName,
              rightDataMemberName,
              db
            );
            break;
          case "RightJoin":
            resultArray = await this.rightJoin(
              this.deleteRowNumberFromArrayAndModifyFieldName(
                leftTable.data,
                leftDataMemberName
              ),
              this.deleteRowNumberFromArrayAndModifyFieldName(
                rightTable.data,
                rightDataMemberName
              ),
              leftTableColumn,
              rightTableColumn,
              leftDataMemberName,
              rightDataMemberName,
              db
            );
          default:
            return new BasisCoreException(
              `Invalid Join Type : ${this.joinType} is not valid join types; valid join types are : [InnerJoin,"LeftJoin","RightJoin","FullJoin"]`
            );
        }
        db = null;
        return new JsonSource(resultArray, this.name);
      } else {
        return new BasisCoreException(
          `fields not provided for joining ${this.leftDataMemberName} and ${this.rightDataMemberName}`
        );
      }
    } catch (error) {
      return new BasisCoreException(
        `error in join ${await this.leftTableColumn.getValueAsync()} and ${await this.rightTableColumn.getValueAsync()} :`,
        error
      );
    }
  }
  /**
   * @param {Array} leftArray
   * @param {Array} rightArray
   * @param {string} fieldInLeftTable
   * @param {string} fieldInRightTable
   * @param {alasql.Database} db
   * @returns Array
   */
  async leftJoin(
    leftArray,
    rightArray,
    fieldInLeftTable,
    fieldInRightTable,
    leftDataMemberName,
    rightDataMemberName,
    db
  ) {
    const joinResult = await this.executeQueryAsync(
      db,
      `SELECT * FROM ? AS [${leftDataMemberName}] LEFT JOIN ? AS [${rightDataMemberName}] ON [${leftDataMemberName}].${fieldInLeftTable} = [${rightDataMemberName}].${fieldInRightTable}`,
      [leftArray, rightArray]
    );
    return joinResult;
  }
  /**
   *
   * @param {Array} leftArray
   * @param {Array} rightArray
   * @param {string} fieldInLeftTable
   * @param {string} fieldInRightTable
   * @param {alasql.Database} db
   * @returns Array
   */
  async rightJoin(
    leftArray,
    rightArray,
    fieldInLeftTable,
    fieldInRightTable,
    leftDataMemberName,
    rightDataMemberName,
    db
  ) {
    const joinResult = await this.executeQueryAsync(
      db,
      `SELECT * FROM ? AS [${leftDataMemberName}] RIGHT JOIN ? AS [${rightDataMemberName}] ON [${leftDataMemberName}].${fieldInLeftTable} = [${rightDataMemberName}].${fieldInRightTable}`[
        (leftArray, rightArray)
      ]
    );
    return joinResult;
  }
  /**
   * @param {Array} leftArray
   * @param {Array} rightArray
   * @param {string} fieldInLeftTable
   * @param {string} fieldInRightTable
   * @param {alasql.Database} db
   * @returns Array
   */
  async innerJoin(
    leftArray,
    rightArray,
    fieldInLeftTable,
    fieldInRightTable,
    leftDataMemberName,
    rightDataMemberName,
    db
  ) {
    const joinResult = await this.executeQueryAsync(
      db,
      `SELECT * FROM ? AS [${leftDataMemberName}] INNER JOIN ? AS [${rightDataMemberName}] ON [${leftDataMemberName}].${fieldInLeftTable} = [${rightDataMemberName}].${fieldInRightTable}`,
      [leftArray, rightArray]
    );
    return joinResult;
  }

  /**
   *
   * @param {IToken} fullColumnName
   * @returns {Promise<[string,string]>}
   */
  async splitDataMemberNameAndColumnName(fullColumnName) {
    const string = await fullColumnName.getValueAsync();
    const array = string.split(".");
    if (array.length < 2) {
      throw new BasisCoreException("invalid column name :" + string);
    } else {
      const columnName = array.pop();
      const dataMemberName = array.join(".");
      return [dataMemberName, columnName];
    }
  }
  deleteRowNumberFromArrayAndModifyFieldName(array, dataMemberName) {
    return array.map((obj) => {
      let newObj = {};
      for (let key in obj) {
        if (key == "RowNumber") {
          continue;
        } else {
          newObj[`${dataMemberName}.${key}`] = obj[key];
        }
      }
      return newObj;
    });
  }
}
