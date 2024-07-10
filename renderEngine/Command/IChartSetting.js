import IChartStyle from "./IChartStyle.js";

export class IChartSetting {
  /** @type {'bar'|'line'} */
  chartType;
  /** @type {string} */
  group;
  /** @type {string} */
  x;
  /** @type {string} */
  y;
  chartTitle;
  /** @type {boolean?} */
  legend;
  /** @type {boolean?} */
  hover;
  /** @type {boolean?} */
  axisLabel;
  /** @type {IChartStyle?} */
  style;
  /** @type {boolean?} */

  grid

}


