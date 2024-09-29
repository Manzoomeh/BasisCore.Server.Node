import alasql from "alasql";
import IContext from "../../Context/IContext.js";
import IDataSource from "../../Source/IDataSource.js";
import StringUtil from "../../Token/StringUtil.js";
import Face from "./Face.js";
import FaceCollection from "./FaceCollection.js";
import FaceRowType from "./FaceRowType.js";
import RawFace from "./RawFace.js";
import CommandElement from "../CommandElement.js";

export default class RawFaceCollection {
  /**@type {RawFace[]} */
  faces;
  /**
   * @param {object[]} ilObject
   */
  constructor(ilObject) {
    this.faces = ilObject.map((x) => new RawFace(x));
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<FaceCollection>}
   */
  async getFaceListAsync(source, context) {
    const faces = this.faces.map(async (x) => {
      const applyReplace = x.applyReplace.getValueAsync(context);
      const applyFunction = x.applyFunction.getValueAsync(context);
      const rowType = x.rowType.getValueAsync(context, FaceRowType.notset);
      const filter = x.filter.getValueAsync(context);
      const template = x.content.getValueAsync(context);
      const level = x.level.getValueAsync(context);

      const retVal = new Face();
      retVal.applyFunction = await applyFunction;
      retVal.applyReplace = await applyReplace;
      retVal.rowType = FaceRowType[(await rowType) ?? FaceRowType.notset];
      retVal.formattedContent = this.formatTemplate(source, await template);
      retVal.relatedRows = this.getRelatedRows(
        source,
        this.formatFilter(source, await filter
      )
      );
      const strLevel = await level;
      retVal.levels = strLevel ? strLevel.split("|") : null;
      return retVal;
    });
    return new FaceCollection(...(await Promise.all(faces)));
  }

  /**
   * @param {IDataSource} source
   * @param {string?} template
   * @returns {string?}
   */
  formatTemplate(source, template) {
    if (template && source) {
      source.columns.forEach((col, index) => {
        const replacement = `{${index}}`;
        const pattern = `(?:@${col}|@col${index + 1}(?!\\d))|@${col}`;
        template = StringUtil.replace(template, pattern, replacement);
      });
    }
    return template;
  }

  /**
   * @param {IDataSource} source
   * @param {string?} filter
   * @returns {string?}
   */
  formatFilter(source, filter) {
    if (filter && source.columns) {
      source.columns.forEach((col, index) => {
        const pattern = `(?:@${col}|@col${index + 1}(?!\\d))|${col}`;
        filter = StringUtil.replace(filter, pattern, col);
      });
    }
    return filter;
  }

  /**
   * @param {IDataSource} source
   * @param {string} filter
   * @returns {Array<any>}
   */
  getRelatedRows(source, filter) {
    /**
     * @type {Array<any>}
     */
    let retVal = null;
    try {
      if (filter) {
        retVal = alasql(`SELECT VALUE FROM ? WHERE ${filter}`, [source.data]);
      } else {
        retVal = source.data;
      }
    } catch (ex) {
      console.error("error in apply filter in face", ex);
      retVal = [];
    }
    return retVal;
  }

  /**
   * @returns {boolean}
   */
  get IsNotNull() {
    return this.faces.length > 0;
  }

  /**
   * @param {CommandElement} ownerTag
   * @param {IContext} context
   * @returns {Promise<void>}
   */
  async addHtmlElementAsync(ownerTag, context) {
    await Promise.all(
      this.faces.map(async (face) => {
        ownerTag.addChild(await face.createHtmlElementAsync(context));
      })
    );
  }
}
