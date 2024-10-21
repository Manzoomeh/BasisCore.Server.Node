import IContext from "../Context/IContext.js";
import StringResult from "../Models/StringResult.js";
import IDataSource from "../Source/IDataSource.js";
import IToken from "../Token/IToken.js";
import StringUtil from "../Token/StringUtil.js";
import TokenUtil from "../Token/TokenUtil.js";
import CommandElement from "./CommandElement.js";
import RenderParam from "./RenderParam.js";
import FaceCollection from "./Renderable/FaceCollection.js";
import RawFaceCollection from "./Renderable/RawFaceCollection.js";
import RawReplaceCollection from "./Renderable/RawReplaceCollection.js";
import ReplaceCollection from "./Renderable/ReplaceCollection.js";
import SourceBaseCommand from "./SourceBaseCommand.js";

export default class RenderableCommand extends SourceBaseCommand {
  /**@type {IToken} */
  dividerTemplate;
  /**@type {IToken} */
  dividerRowCount;
  /**@type {IToken} */
  incompleteTemplate;
  /**@type {IToken} */
  elseLayout;
  /**@type {IToken} */
  layout;
  /**@type {RawFaceCollection} */
  rawFaces;
  /**@type {RawReplaceCollection} */
  replaces;

  /**
   * @param {object} renderableCommandIl
   */
  constructor(renderableCommandIl) {
    super(renderableCommandIl);
    this.dividerTemplate = TokenUtil.getFiled(
      renderableCommandIl,
      "divider-content"
    );
    this.dividerRowCount = TokenUtil.getFiled(
      renderableCommandIl,
      "divider-rowcount"
    );
    this.incompleteTemplate = TokenUtil.getFiled(
      renderableCommandIl,
      "incomplete-content"
    );
    this.elseLayout = TokenUtil.getFiled(
      renderableCommandIl,
      "else-layout-content"
    );
    this.layout = TokenUtil.getFiled(renderableCommandIl, "layout-content");
    this.rawFaces = new RawFaceCollection(renderableCommandIl["faces"]);
    this.replaces =renderableCommandIl["replaces"] ?new RawReplaceCollection(renderableCommandIl["replaces"]) : new RawReplaceCollection(renderableCommandIl["Replaces"]) ;
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _renderAsync(source, context) {
    const [
      face,
      replace,
      dividerRowCount,
      dividerTemplate,
      incompleteTemplate,
    ] = await Promise.all([
      this.rawFaces
        ? this.rawFaces.getFaceListAsync(source, context)
        : Promise.resolve([]),
      this.replaces.processAsync(console),
      this.dividerRowCount.getValueAsync(context) ?? Promise.resolve(0),
      this.dividerTemplate.getValueAsync(context),
      this.incompleteTemplate.getValueAsync(context),
    ]);
    const renderResult = await this.renderInternallyAsync(
      source,
      context,
      face,
      replace,
      dividerRowCount,
      dividerTemplate,
      incompleteTemplate
    );
    let result = null;
    if ((renderResult?.length ?? 0) > 0) {
      const layout = await this.layout.getValueAsync(context);
      result = layout
        ? StringUtil.replace(layout, "@child", renderResult)
        : renderResult;
    } else {
      result = await this.elseLayout.getValueAsync(context);
    }
    return new StringResult(result);
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @param {FaceCollection?} faces,
   * @param {ReplaceCollection?} replaces ,
   * @param {number?} dividerRowCount ,
   * @param {string?} dividerTemplate ,
   * @param {string?} incompleteTemplate ,
   * @returns {Promise<string>}
   */
  renderInternallyAsync(
    source,
    context,
    faces,
    replaces,
    dividerRowCount,
    dividerTemplate,
    incompleteTemplate
  ) {
    const param = new RenderParam(
      replaces,
      source?.data.length ?? 0,
      dividerRowCount,
      dividerTemplate,
      incompleteTemplate
    );
    let retVal = "";
    if (source) {
      source.data.forEach((row) => {
        param.data = row;
        const renderResult = faces.render(param, context);
        if (renderResult) {
          retVal += renderResult;
        }
      });
      return Promise.resolve(retVal);
    }
  }

  /**
   * @param {IContext} context
   * @returns {Promise<CommandElement>}
   */
  async createHtmlElementAsync(context) {
    const tag = await super.createHtmlElementAsync(context);
    if (this.layout.IsNotNull) {
      const layout = new CommandElement("layout");
      await layout.addRawContentIfExistAsync(this.layout, context);
      tag.addChild(layout);
    }
    if (this.elseLayout.IsNotNull) {
      const layout = new CommandElement("else-layout");
      await layout.addRawContentIfExistAsync(this.elseLayout, context);
      tag.addChild(layout);
    }
    if (this.rawFaces.IsNotNull) {
      await this.rawFaces.addHtmlElementAsync(tag, context);
    }
    if (this.replaces.IsNotNull) {
      await this.replaces.addHtmlElementAsync(tag, context);
    }
    if (this.dividerRowCount.IsNotNull) {
      const layout = new CommandElement("divider");
      await layout.addAttributeIfExistAsync(
        "rowcount",
        this.dividerRowCount,
        context
      );
      await layout.addRawContentIfExistAsync(this.dividerTemplate, context);
      tag.addChild(layout);
    }
    return tag;
  }
}
