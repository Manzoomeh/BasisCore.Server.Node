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
import DonutChart from "./DonutChart.js";
import HalfDonutChart from "./HalfDonutChart.js";
export default class ChartCommand extends SourceBaseCommand {
  /** @type {IChartSetting} */
  chartSetting;
  /** @type {string} */
  layout;
  /** @type {d3} */

  chart;

  /**
   * @param {object} chartCommandIl
  */
  chartCommandIl
  /**@type {BarChart | LineChart | FunnelChart | DonutChart} */

  chartManager;
  /**
  * @type {object}
  */
  style = {
    color: ["#004B85", "#FF7A00", "#00A693", "#B40020"],
    width: 800,
    height: 400,
    marginY: 40,
    marginX: 40,

  };
  constructor(chartCommandIl) {
    super(chartCommandIl);
    this.chartCommandIl = chartCommandIl
    this.layout = TokenUtil.getFiled(chartCommandIl, "layout-content");
    this.style = { ...this.style, ...this.chartCommandIl.chartStyle }
    Object.keys(this.chartCommandIl).map(e => {
      if (e.startsWith('style_')) {
        this.style[e.split('_')[1]] = this.chartCommandIl[e]
      }
    })
    console.log('this.style', this.style)
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
    const { width, height, marginX, marginY, backgroundColor } =
      this.style

    const document = dom.window.document;

    // Create the SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.chart = d3
      .select(svg)
      .attr("width", width + 2 * marginX)
      .attr("height", this.chartCommandIl.legend == 'true' ? height + 2 * marginY + 20 : height + 2 * marginY)

      .style("background-color", backgroundColor)
      .append("g")
      .attr("transform", "translate(" + marginX + "," + marginY + ")");
    let chartSetting = {
      chartType: this.chartCommandIl.chartType,
      group: this.chartCommandIl.group,
      y: this.chartCommandIl.y,
      x: this.chartCommandIl.x,
      chartTitle: this.chartCommandIl.chartTitle,
      legend: this.chartCommandIl.legend == "true",
      hover: this.chartCommandIl.hover == "true",
      grid: this.chartCommandIl.grid == "true",

      style: this.style,
      axisLabel: this.chartCommandIl.axisLabel == 'true'
    };
    document.body.appendChild(svg);
    // Create the chart based on the chart type
    switch (chartSetting.chartType) {
      case "bar":
        chartSetting.horizontal = this.chartCommandIl.horizontal == 'true'

        this.chartManager = new BarChart(
          data,
          chartSetting,
          this.chart,
          document
        );
        break;
      case "line":
        this.chartManager = new LineChart(
          data,
          chartSetting,
          this.chart,
          document
        );
        break;
      case "funnel":
        this.chartManager = new FunnelChart(
          data,
          chartSetting,
          this.chart,
          document
        );
        break;
      case "donut":
        this.chartContent ? chartSetting.chartContent = this.chartContent : null

        this.chartManager = new DonutChart(
          data,
          chartSetting,
          this.chart,
          document
        );
        break;
      case "halfdonut":
        this.chartContent ? chartSetting.chartContent = this.chartContent : null

        this.chartManager = new HalfDonutChart(
          data,
          chartSetting,
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
