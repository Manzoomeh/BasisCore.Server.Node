import StringResult from "../../Models/StringResult.js";
import StringUtil from "../../Token/StringUtil.js";
import TokenUtil from "../../Token/TokenUtil.js";
import SourceBaseCommand from "../SourceBaseCommand.js";
import * as d3 from "d3";
import { JSDOM } from "jsdom";
import BarChart from "./BarChart.js";
import LineChart from "./LineChart.js";
import ICommandResult from "../../Models/ICommandResult.js";
import FunnelChart from "./FunnelChart.js";
export default class ChartCommand extends SourceBaseCommand {
  /** @type {IChartSetting} */
  chartSetting;
  /** @type {string} */
  layout;
  /**@type {object} */
  chart;
  /**@type {BarChart | LineChart | FunnelChart} */

  chartManager;
  /**
   * @param {object} chartCommandIl
   */
  constructor(chartCommandIl) {
    super(chartCommandIl);
    this.layout = TokenUtil.getFiled(chartCommandIl, "layout-content");

    this.chartSetting = chartCommandIl.setting || {
      chartType: "bar",
      style: {
        width: 800,
        height: 400,
        marginY: 40,
        marginX: 40,
      },
    };
  }
  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<ICommandResult>}
   */
  async _renderAsync(source, context) {
    const renderResult = await this.renderInternallyAsync(source, context);
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

  createChart(data) {
    const dom = new JSDOM("", { pretendToBeVisual: true });
    const { width, height, marginX, marginY, backgroundColor, textColor } =
      this.chartSetting.style;

    const document = dom.window.document;

    // Create the SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.chart = d3
      .select(svg)
      .attr("width", width + 2 * marginX)
      .attr("height", height + 2 * marginY)

      .style("background-color", backgroundColor)
      .append("g")
      .attr("transform", "translate(" + marginX + "," + marginY + ")");

    document.body.appendChild(svg);

    // Create the chart based on the chart type
    switch (this.chartSetting.chartType) {
      case "bar":
        this.chartManager = new BarChart(
          data,
          this.chartSetting,
          this.chart,
          document
        );
        break;
      case "line":
        this.chartManager = new LineChart(
          data,
          this.chartSetting,
          this.chart,
          document
        );
        break;
      case "funnel":
        this.chartManager = new FunnelChart(
          data,
          this.chartSetting,
          this.chart,
          document
        );
        break;
      default:
        throw new Error(
          `Chart type ${this.chartSetting.chartType} is not supported`
        );
    }
    this.chartManager.renderChart();
    this.chartManager.applyFeatures();
    return document.body.innerHTML;
  }

  /**
   * @param {IDataSource} source
   * @param {IContext} context
   * @returns {Promise<string>}
   */

  async renderInternallyAsync(source, context) {
    if (source.data?.length > 0) {
      return this.createChart(source.data);
    }
  }
}
