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
   *
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
    const retVal = new CommandElement("member");
    await Promise.all([
      retVal.addAttributeIfExistAsync("name", this.name, context),
      retVal.addAttributeIfExistAsync("preview", this.preview, context),
      retVal.addAttributeIfExistAsync("sort", this.sort, context),
      retVal.addAttributeIfExistAsync("postsql", this.postSql, context),
    ]);
    if (this.extraAttributes) {
      for (const key in this.extraAttributes) {
        if (Object.hasOwn(this.extraAttributes, key)) {
          const attribute = this.extraAttributes[key];
          await retVal.addAttributeIfExistAsync(key, attribute, context);
        }
      }
    }
    if (this.rawContent) {
      await retVal.addRawContentIfExistAsync(this.rawContent, context);
    }
    return retVal;
  }

  /**
   *
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
    source.id = `${sourceSchemaName}.${this.name}`;
    SourceUtil.addToContext(source, context, preview, sort, postSql);
  }
}
