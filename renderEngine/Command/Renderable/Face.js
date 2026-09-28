import FaceRowType from "./FaceRowType.js";

export default class Face {
  /** @type {boolean} */
  applyReplace;
  /** @type {boolean} */
  applyFunction;
  /** @type {FaceRowType} */
  rowType;
  /** @type {object[]} */
  relatedRows;
  /** @type {string} */
  formattedContent;
  /** @type {Array<string>?} */
  levels;
  /** @type {Array<string>?} */
  columns;
  /** @type {Array<object>?} */
  sourceRows;
  /** @type {number?} */
  debugIndex;
  /** @type {string?} */
  sourceId;
  /** @type {string?} */
  rawFilter;
  /** @type {string?} */
  formattedFilter;
  /** @type {string?} */
  rawTemplate;
}
