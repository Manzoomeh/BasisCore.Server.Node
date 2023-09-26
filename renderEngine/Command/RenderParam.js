import FaceRowType from "./Renderable/FaceRowType.js";
import ReplaceCollection from "./Renderable/ReplaceCollection.js";

export default class RenderParam {
  /** @type {any} */
  data;
  /** @type {ReplaceCollection} */
  replaces;
  /** @type {Array<string>} */
  levels;
  /** @type {number} */
  _renderableCount;
  /** @type {number} */
  _renderedCount;
  /** @type {number} */
  _cellPerRow;
  /** @type {string} */
  dividerTemplate;
  /** @type {string} */
  incompleteTemplate;
  /** @type {number} */
  _renderedCell;

  /** @returns {boolean} */
  get isEnd() {
    return this._renderableCount == this._renderedCount;
  }

  /** @returns {number} */
  get emptyCell() {
    return this._cellPerRow - this._renderedCell;
  }

  /** @returns {FaceRowType} */
  get rowType() {
    return this._renderedCount % 2 == 0 ? FaceRowType.odd : FaceRowType.even;
  }

  /** @returns {boolean} */
  get mustApplyDivider() {
    return (
      this.dividerTemplate?.length > 0 && this._renderedCell == 0 && !this.isEnd
    );
  }

  /**
   *
   * @param {ReplaceCollection} replaces
   * @param {number} renderableCount
   * @param {number} recordPerRow
   * @param {string} dividerTemplate
   * @param {string} incompleteTemplate
   */
  constructor(
    replaces,
    renderableCount,
    recordPerRow,
    dividerTemplate,
    incompleteTemplate
  ) {
    this.replaces = replaces;
    this._cellPerRow = recordPerRow;
    this.dividerTemplate = dividerTemplate;
    this.incompleteTemplate = incompleteTemplate;
    this._renderableCount = renderableCount;
    this._renderedCount = 0;
    this._renderedCell = 0;
  }

  setRendered() {
    this._renderedCount++;
    if (this._cellPerRow != 0) {
      this._renderedCell = this._renderedCount % this._cellPerRow;
    }
  }

  setIgnored() {
    this._renderedCount--;
  }

  /**
   * @param {Array<string>} levels
   */
  setLevel(levels) {
    this.levels = levels;
  }
}
