import IChartStyle from "./IChartStyle";

export default class IChartSetting {
  /** @type {'bar'|'line'} */
  chartType;
  /** @type {string} */
  columnKey;
  /** @type {string} */
  xKey;
  /** @type {string} */
  yKey;
  chartTitle;
  /** @type {boolean?} */
  legend;
  /** @type {boolean?} */
  axisLabel;
  /** @type {IChartStyle?} */
  style;
}
