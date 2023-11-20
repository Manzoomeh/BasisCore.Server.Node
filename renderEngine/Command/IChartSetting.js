import IChartStyle from "./IChartStyle";

export default class IChartSetting {
  /** @type {'bar'|'line'} */
  chartType;
  /** @type {string} */
  xKey;
  /** @type {string} */
  yKey;
  chartTitle;
  /** @type {boolean?} */
  legend;
  /** @type {boolean?} */
  axisLabel;
  /** @type {number} */
  /** @type {IChartStyle?} */
  style;
}
