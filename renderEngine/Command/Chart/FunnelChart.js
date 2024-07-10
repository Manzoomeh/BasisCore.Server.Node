import * as d3 from "d3";

export default class FunnelChart {
  /**
   * @param {any}
   */
  data;
  /** @type {IChartSetting} */
  chartSetting;
  /**@type {object} */

  chart;
  /**@type {string} */

  script;
  /**@type {Document} */
  dom;
  /**@type {d3.ScaleLinear} */
  horizontalScale;
  /** @type {d3.ScaleBand} */
  verticalScale;
  constructor(data, chartSetting, chart, dom) {
    this.data = d3.sort(data, (e) => e[chartSetting.y]).reverse();
    this.chart = chart;
    this.chartSetting = chartSetting;
    this.script = "";

    this.dom = dom;
  }
  renderChart() {
    const { group, y } = this.chartSetting;
    const { width, height, color, opacity, innerPadding } = this.chartSetting.style;
    this.horizontalScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d[y])])
      .range([0, width]);

    this.verticalScale = d3
      .scaleBand(
        this.data.map((e) => e[group]),
        [0, height]
      )
      .paddingInner(innerPadding || 0);
    const polygons = this.trapezoidGenerator(
      this.data.map((e) => e[y]),
      this.data.map((e) => e[group])
    )
    this.chart
      .selectAll("polygon")
      .data(
        polygons
      )

      .join("polygon")
      .attr("points", (d) => d.points)
      .attr("class", "polygon")
      .attr("title", (d) => d.title)
      .attr("fill", (d, i) => {
        var rgb = d3.rgb(color[i % color.length]);
        return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
      })
      .attr("stroke", (d, i) => {
        return color[i % color.length];
      })
  }
  applyFeatures() {
    const { width, height, marginY, textColor, opacity,color,marginX } = this.chartSetting.style;
    const { chartTitle, axisLabel, hover, group, y, legend } = this.chartSetting;
    if (legend && group) {
      var legendElement = this.chart.selectAll(".legend")
        .data(this.data)
        .enter().append("foreignObject").attr('x', function (_, i) {
          return i * 75
        })
        .attr('y', function () {
          return Number(height) + 20
        })
        .attr('width', 100)
        .attr('height', 100).append('xhtml:div')
        .attr("class", "legend")

      legendElement.append('svg').attr("width", 24)
        .attr("height", 12)
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 24)
        .attr("height", 12).attr("rx", 5)
        .attr("fill", (d, i) => {
          var rgb = d3.rgb(color[i % color.length]);
          return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
        })
        .attr("stroke", (_, i) => {
          return color[i % color.length];
        })
      legendElement.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text((d) => { return d[group]; });
    }
    if (axisLabel) {
      const fontSize = d3.min([16, height / (this.data.length * 2 * 2)]);

      this.chart
        .selectAll("labels")
        .data(this.data)
        .join("text")

        .attr("font-size", fontSize)
        .attr("text-anchor", "middle")
        .attr("x", width / 2 + marginX)
        .attr(
          "y",
          (d) =>
            this.verticalScale(d[group]) +
            height / this.data.length / 2 -
            fontSize / 2
        )
        .text((d) => d[group]);
      this.chart
        .selectAll("labels")
        .data(this.data)
        .join("text")
        .attr("font-size", fontSize)
        .attr("text-anchor", "middle")
        .attr("x", width / 2 + marginX)
        .attr(
          "y",
          (d) =>
            this.verticalScale(d[group]) +
            height / this.data.length / 2 +
            fontSize / 2
        )
        .text((d) => d[y]);
    }
    if (chartTitle) {
      // Add the chart title

      this.chart
        .append("text")
        .attr("x", width / 2 + marginX)
        .attr("y", -marginY / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(chartTitle);
    }
    if (hover) {
      const tooltip = this.dom.createElement("div");

      tooltip.setAttribute("id", "tooltip");
      tooltip.setAttribute("class", "tooltip");
      this.dom.body.appendChild(tooltip);
      const script = this.dom.createElement("script");
      const style = this.dom.createElement("style");
      script.textContent = `
      const polygons = document.querySelectorAll("polygon");const tooltip = document.querySelector(".tooltip");const mouseover = function (d) {d.target.setAttribute('style','opacity:0.7')};const mousemove = function (event, d) {tooltip.innerHTML =  '<div style="display:flex;flex-direction:column;padding:4px"><div style="padding:3px;display:flex;flex-direction:row;justify-content:space-between;align-items:center;direction:ltr"><div class="colorbox" style="background-color:' +  event.target.attributes.stroke.value +  '"></div>' +  event.target.attributes.title.value +  "</div></div>";tooltip.setAttribute(  "style",  "top:" + (event.pageY - 10) + "px;left:" + (event.pageX + 80) + "px" + ";opacity:0.8");};const mouseleave = function (d) {tooltip.setAttribute("style", "opacity:0.0");d.target.setAttribute('style','opacity: 1;')};polygons.forEach((e) => {e.addEventListener("mousemove", mousemove);e.addEventListener("mouseover", mouseover);e.addEventListener("mouseleave", mouseleave);});`.trim();
      this.dom.body.appendChild(script);
      style.textContent = `.legend {display: flex;flex-direction: column;justify-content: center;align-items: center;gap: 10px;}  .tooltip {opacity:0.0;top: -5px;left: 105%;margin-left: -60px;position: absolute;font-size: 11px;padding: 4px;border-radius: 5px;color: #fff;border: none;box-shadow: 0px 0px 3px 0px #e6e6e6;background-color: rgba(0, 0, 0, 0.9);}  .colorbox {width: 13px;height: 13px;border: #fff solid 2px;border-radius: 2px;margin-right: 10px;}`;
      this.dom.body.appendChild(style);
    }
    if (textColor) {
      this.chart.selectAll("text").attr("fill", textColor);
    }
  }
  trapezoidGenerator(xValues, yValues) {
    let prevX2 = 0;
    let prevX3 = 0;
    return xValues.map((value, index) => {
      const x0 = prevX3;
      const x1 = index === 0 ? this.horizontalScale(value) : prevX2;
      const x2 =
        x1 -
        (this.horizontalScale(value) -
          this.horizontalScale(xValues[index + 1] || xValues[index])) /
        2;
      const x3 =
        x2 - this.horizontalScale(xValues[index + 1] || xValues[index]);
      prevX2 = x2;
      prevX3 = x3;
      const y0 = this.verticalScale(yValues[index]);
      const y1 = y0;
      const y2 =
        this.verticalScale(yValues[index]) + this.verticalScale.bandwidth();
      const y3 = y2;

      return {
        title: yValues[index],
        points: [
          [
            x0 +

            this.chartSetting.style.marginX,
            y0,
          ],
          [
            x1 +

            this.chartSetting.style.marginX,
            y1,
          ],
          [
            x2 +

            this.chartSetting.style.marginX,
            y2,
          ],
          [
            x3 +
            this.chartSetting.style.marginX,
            y3,
          ],
          [
            x0 +
            this.chartSetting.style.marginX,
            y0,
          ],
        ],
      };
    });
  }
}
