import { XMLParser } from "fast-xml-parser";
import InMemoryMember from "./InMemoryMember.js";

export default class TableMember extends InMemoryMember {
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
    console.log(content);
    const parser = new XMLParser();
    const json = parser.parse(`<Data>${content}</Data>`);
    console.log(json);
    throw new Error("executeCommandAsync not implemented");
  }
}
