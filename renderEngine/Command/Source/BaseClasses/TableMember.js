import { XMLParser } from "fast-xml-parser";
import InMemoryMember from "./InMemoryMember.js";
import JsonSource from "../../../Source/JsonSource.js";

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
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const json = parser.parse(content);
    return new JsonSource(
      Array.isArray(json.row) ? json.row : [json.row],
      this.name
    );
  }
}
