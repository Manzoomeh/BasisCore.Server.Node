import IContext from "../../../Context/IContext.js";
import IDataSource from "../../../Source/IDataSource.js";
import SourceUtil from "../../../Source/SourceUtil.js";
import IToken from "../../../Token/IToken.js";
import TokenUtil from "../../../Token/TokenUtil.js";
import ValueToken from "../../../Token/ValueToken.js";
import CommandElement from "../../CommandElement.js";

export default class Member {
  /**@type {string} */
  name;
  /**@type {IToken} */
  preview;
  /**@type {IToken} */
  sort;
  /**@type {IToken} */
  postSql;
  /**@type {NodeJS.Dict<IToken>} */
  extraAttributes;
  /**@type {IToken} */
  rawContent;

  /**
   * @param {object} commandIL
   */
  constructor(commandIL) {
    this.name = commandIL["name"];
    this.preview = TokenUtil.getFiled(commandIL, "preview");
    this.sort = TokenUtil.getFiled(commandIL, "sort");
    this.postSql = TokenUtil.getFiled(commandIL, "postsql");
    this.rawContent = TokenUtil.getFiled(commandIL, "content");
    this.extraAttributes = null;
    /**@type {NodeJS.Dict?} */
    const items = commandIL["extra-attribute"];
    if (items) {
      this.extraAttributes = {};
      Object.entries(items).map(
        (pair) =>
          (this.extraAttributes[pair[0]] = pair[1]
            ? TokenUtil.ToToken(pair[1])
            : ValueToken.Null)
      );
    }
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = new CommandElement("member");
    tag.addAttributeIfExist("name", this.name);
    await Promise.all([
      tag.addAttributeIfExistAsync("preview", this.preview, context),
      tag.addAttributeIfExistAsync("sort", this.sort, context),
      tag.addAttributeIfExistAsync("postsql", this.postSql, context),
    ]);
    if (this.extraAttributes) {
      if (this.extraAttributes) {
        await Promise.all(
          Object.entries(this.extraAttributes).map((pair) =>
            tag.addAttributeIfExistAsync(pair[0], pair[1], context)
          )
        );
      }
    }
    await tag.addRawContentIfExistAsync(this.rawContent, context);
    return tag;
  }

  /**
   * @param {IDataSource} source
   * @param {string} sourceSchemaName
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async addDataSourceAsync(source, sourceSchemaName, context) {
    const [postSql, sort, preview] = await Promise.all([
      this.postSql.getValueAsync(context),
      this.sort.getValueAsync(context),
      this.preview.getValueAsync(context),
    ]);
    source.id = `${sourceSchemaName}.${this.name}`.toLowerCase();
    SourceUtil.addToContext(source, context, preview, sort, postSql);
  }
}
