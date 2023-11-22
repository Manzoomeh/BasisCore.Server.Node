import StringResult from "../Models/StringResult.js";
import StringUtil from "../Token/StringUtil.js";
import TokenUtil from "../Token/TokenUtil.js";
import SourceBaseCommand from "./SourceBaseCommand.js";
import * as d3 from "d3";
import { JSDOM } from "jsdom";
export default class ChartCommand extends SourceBaseCommand {
  /** @type {IChartSetting} */
  chartSetting;
  /** @type {string} */
  layout;
  /**@type {object} */
  chart;
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
        this.createBarChart(data);
        break;
      case "line":
        this.createLineChart(data);
        break;
      default:
        throw new Error(
          `Chart type ${this.chartSetting.chartType} is not supported`
        );
    }
    this.chart.selectAll("text").style("color", textColor);

    return dom.window.document.body.innerHTML;
  }
  createBarChart(data) {
    const { xKey, yKey } = this.chartSetting;
    const { width, height } = this.chartSetting.style;
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d[xKey]))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d[yKey])])
      .range([height, 0]);
    this.applyFeatures(yScale, xScale);

    const bars = this.chart
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d[xKey]))
      .attr("y", (d) => yScale(d[yKey]))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d[yKey]))
      .attr("fill", (d, i) => {
        return d3.schemeCategory10[i];
      });
  }
  createLineChart(data) {
    const { xKey, yKey } = this.chartSetting;
    const { width, height } = this.chartSetting.style;

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[xKey]))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[yKey]))
      .range([height, 0]);

    this.applyFeatures(yScale, xScale);
    const line = d3
      .line()
      .x((d) => xScale(d[xKey]))
      .y((d) => yScale(d[yKey]));
    this.chart
      .append("path")
      .datum(data)
      .attr("d", line)
      .style("fill", "none")
      .attr("stroke", (_, i) => {
        return d3.schemeCategory10[i];
      });
  }
  /** @type {d3.ScaleLinear} */
  y;
  /**@type {d3.ScaleLinear|d3.scaleBand} */
  x;
  applyFeatures(y, x) {
    const { height, width, marginY } = this.chartSetting.style;
    const { chartTitle, axisLabel } = this.chartSetting;
    // Apply features to the chart
    if (axisLabel) {
      // Add the x-axis

      this.chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      // Add the y-axis
      this.chart.append("g").call(d3.axisLeft(y));
    }
    if (chartTitle) {
      // Add the chart title

      this.chart
        .append("text")
        .attr("x", width / 2)
        .attr("y", -marginY / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(chartTitle);
    }
    // TODO : add hover functionality and add listeners  to dom
    // if (hover) {
    //   this.chart
    //     .selectAll("rect")
    //     .on("mouseover", function () {
    //       d3.select(this).style("fill", "red");
    //     })
    //     .on("mouseout", function () {
    //       d3.select(this).style("fill", null);
    //     });
    // }
    // TODO : handle legend
    // if (legend) {
    //   // Add legend
    //   const { width, height, xKey, yKey } = this.chartSetting;
    //   const legend = this.chart
    //     .append("g")
    //     .attr("transform", `translate(${width - 100}, 20)`);

    //   const legendItems = legend
    //     .selectAll(".legend-item")
    //     .data(data)
    //     .enter()
    //     .append("g")
    //     .attr("class", "legend-item")
    //     .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    //   legendItems
    //     .append("rect")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", 10)
    //     .attr("height", 10)
    //     .style("fill", (d, i) => d3.schemeCategory10[i]);

    //   legendItems
    //     .append("text")
    //     .attr("x", 20)
    //     .attr("y", 10)
    //     .text((d) => d[xKey])
    //     .style("fill", style.textColor)
    //     .style("font-size", "12px");
    // console.log("legend.node() ", Object.keys(legend.node()));
    // const legendWidth = legend.node().getBBox().width;
    // const legendHeight = legend.node().getBBox().height;

    // legend.attr(
    //   "transform",
    //   `translate(${width - legendWidth - 20}, ${height - legendHeight - 20})`
    // );
    // }
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
