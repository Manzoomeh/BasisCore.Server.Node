import * as d3 from "d3";
import { IDonutChartSetting } from "../IDonutChartSetting.js";

export default class DonutChart {
  /**
   * @param {any}
   */
  data;
  /** @type {IDonutChartSetting} */
  chartSetting;
  /**@type {object} */

  chart;
  /**@type {string} */

  script;
  /**@type {Document} */
  dom;
  /**@type {number} */
  radius
  constructor(data, chartSetting, chart, dom) {
    this.data = data;
    this.chart = chart;
    this.script = "";
    this.chartSetting = chartSetting

    this.dom = dom;
    this.radius = Math.min(this.chartSetting.style.width, this.chartSetting.style.height) / 2

  }
  renderChart() {
    const { group, y, legend, chartContent } = this.chartSetting;
    const { width, height, cornerRadius, innerRadiusDistance, outerRadiusDistance, opacity } = this.chartSetting.style;

    var arc = d3.arc()
      .outerRadius(this.radius - (outerRadiusDistance || 10))
      .innerRadius(this.radius - (innerRadiusDistance || 70))
      .cornerRadius(cornerRadius || 0);

    var pie = d3.pie()
      .sort(null)
      .value((d) => { return d[y]; })

    var svg = this.chart
      .attr("width", width)
      .attr("height", legend ? height + 30 : height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    var g = svg.selectAll(".arc")
      .data(pie(this.data))
      .enter().append("g")

    g.append("path")
      .attr("class", "arc")

      .attr("d", arc).attr("title", (d) => { return d.data[group] })
      .attr("fill", (d) => {
        var rgb = d3.rgb(this.color[d.index]);
        return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
      })
      .attr("stroke", (d) => {
        return this.color[d.index];
      })

    g.append("text")
      .attr("transform", (d) => { return "translate(" + arc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text((d) => { if (group) { return d.data[group] } else { return null } });
    if (chartContent) {
      this.chart.append("foreignObject").attr('x', (d, i) => {
        return ((width / 2) - ((innerRadiusDistance || 70) * Math.sqrt(2))) + 10
      })
        .attr('y', (d) => {
          return ((height / 2) - ((innerRadiusDistance || 70) * Math.sqrt(2))) + 10
        })
        .attr('width', (this.radius - (innerRadiusDistance || 70)) * Math.sqrt(2) - 10)
        .attr('height', (this.radius - (innerRadiusDistance || 70)) * Math.sqrt(2) - 10).html(chartContent)
    }
  }
  applyFeatures() {
    const { height, width, marginY, textColor, opacity } = this.chartSetting.style;
    const { chartTitle, hover, legend, group } = this.chartSetting;
    if (legend && group) {
      var legendElement = this.chart.selectAll(".legend")
        .data(this.data)
        .enter().append("foreignObject").attr('x', function (d, i) {
          return i * 75
        })
        .attr('y', function (d) {
          return height
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
          var rgb = d3.rgb(this.color[i % this.color.length]);
          return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
        })
        .attr("stroke", (d, i) => {
          return this.color[i % this.color.length];
        })
      legendElement.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text((d) => { return d[group]; });
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
    if (hover) {
      const tooltip = this.dom.createElement("div");

      tooltip.setAttribute("id", "tooltip");
      tooltip.setAttribute("class", "tooltip");
      this.dom.body.appendChild(tooltip);
      const script = this.dom.createElement("script");
      const style = this.dom.createElement("style");
      script.textContent = `
      const arcs = document.querySelectorAll(".arc");const tooltip = document.querySelector(".tooltip");const mouseover = function (d) {d.target.setAttribute('style','opacity:0.7')};const mousemove = function (event, d) {tooltip.innerHTML =  '<div style="display:flex;flex-direction:column;padding:4px"><div style="padding:3px;display:flex;flex-direction:row;justify-content:space-between;align-items:center;direction:ltr"><div class="colorbox" style="background-color:' +  event.target.attributes.stroke.value +  '"></div>' +  event.target.attributes.title.value +  "</div></div>";tooltip.setAttribute(  "style",  "top:" + (event.pageY - 10) + "px;left:" + (event.pageX + 80) + "px" + ";opacity:0.8");};const mouseleave = function (d) {tooltip.setAttribute("style", "opacity:0.0");d.target.setAttribute('style','opacity: 1;')};arcs.forEach((e) => {e.addEventListener("mousemove", mousemove);e.addEventListener("mouseover", mouseover);e.addEventListener("mouseleave", mouseleave);});`.trim();
      this.dom.body.appendChild(script);
      style.textContent = ` .legend {display: flex;flex-direction: column;justify-content: center;align-items: center;gap: 10px;} .tooltip {opacity:0.0;top: -5px;left: 105%;margin-left: -60px;position: absolute;font-size: 11px;padding: 4px;border-radius: 5px;color: #fff;border: none;box-shadow: 0px 0px 3px 0px #e6e6e6;background-color: rgba(0, 0, 0, 0.9);}  .colorbox {width: 13px;height: 13px;border: #fff solid 2px;border-radius: 2px;margin-right: 10px;}`;
      this.dom.body.appendChild(style);
    }
    if (textColor) {
      this.chart.selectAll("text").style("color", textColor);
    }
  }
}
