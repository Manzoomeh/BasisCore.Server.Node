import IContext from "../../Context/IContext.js";
import StringUtil from "../../Token/StringUtil.js";
import RenderParam from "../RenderParam.js";
import Face from "./Face.js";
import FaceRowType from "./FaceRowType.js";

export default class FaceCollection extends Array {
  /**
   * @param {RenderParam} param
   * @param {IContext} context
   * @returns {string}
   */
  render(param, context) {
    /** @type {string} */
    let retVal = null;
    if (this.length == 0) {
      retVal = param.data[0]?.toString();
      param.setRendered();
    } else {
      /** @type {Face} */
      const firstMatchFace = this.find((x) => {
        /** @type {Face} */
        const current = x;
        return (
          current.relatedRows.indexOf(param.data) != -1 &&
          (current.rowType == FaceRowType.notset ||
            current.rowType == param.rowType) &&
          (current.levels == null ||
            current.levels.some((x) => param.levels.indexOf(x) != -1))
        );
      });
      if (firstMatchFace) {
        param.data = this.changeNullToBlank(param.data);
        console.log(param.data)
        if (firstMatchFace.formattedContent) {
          retVal = StringUtil.format(
            firstMatchFace.formattedContent,
            Object.values(param.data)
          );
          if (firstMatchFace.applyReplace && param.replaces) {
            retVal = param.replaces.apply(retVal, context.cancellation);
          }
          if (firstMatchFace.applyFunction) {
            //TODO: apply function
          }
        }
        param.setRendered();
        if (param.mustApplyDivider && param.dividerTemplate) {
          retVal += param.dividerTemplate;
        }
        if (param.isEnd && param.incompleteTemplate) {
          let tmp = param.emptyCell;
          while (tmp > 0) {
            context.cancellation.throwIfCancellationRequested();
            retVal += param.incompleteTemplate;
            tmp--;
          }
        }
      } else {
        param.setIgnored();
      }
    }
    return retVal;
  }
  changeNullToBlank(obj) {
    for (const key in obj) {
      if (
        obj.hasOwnProperty(key) &&
        (obj[key] === null || obj[key] === undefined)
      ) {
        obj[key] = "";
      }
    }
    return obj
  }
}
