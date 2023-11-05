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
}
