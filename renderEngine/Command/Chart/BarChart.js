import * as d3 from "d3";
import { IBarChartSetting } from "../IBarChartSetting.js";

export default class BarChart {
  /**
   * @param {any}
   */
  data;
  /** @type {IBarChartSetting} */
  chartSetting;
  /**@type {object} */

  chart;
  /**@type {string} */

  script;
  /**@type {Document} */
  dom;
  /**@type {d3.ScaleLinear|d3.scaleBand} */
  xScale;
  /** @type {d3.ScaleLinear|d3.scaleBand} */

  yScale;
  constructor(data, chartSetting, chart, dom) {
    this.data = data;
    this.chart = chart;
    this.chartSetting = chartSetting;
    this.script = "";
    this.dom = dom;


  }
  renderChart() {
    const { group, x, y, horizontal } = this.chartSetting;
    const { width, height, opacity, color } = this.chartSetting.style;
    if (x && y && group) {

      if (horizontal) {
        this.groupScale = d3.scaleBand()
          .domain(new Set(this.data.map(d => d[group])))
          .range([height, 0])
          .paddingInner(0.1);
        console.log('this.groupScale.bandwidth()', this.groupScale.bandwidth(), width, new Set(this.data.map(d => d[group])))
        this.xScale = d3.scaleBand()
          .domain(new Set(this.data.map(d => d[x])))
          .range([0, this.groupScale.bandwidth()])
          .padding(0.05);
        this.yScale = d3.scaleLinear()
          .domain([0, d3.max(this.data, d => d[y])]).nice()
          .range([0, width]);
        this.groupScale = d3.scaleBand()
          .domain(new Set(this.data.map(d => d[group])))
          .range([0, height])
          .paddingInner(0.1);
        this.xScale = d3.scaleBand()
          .domain(new Set(this.data.map(d => d[x])))
          .range([0, this.groupScale.bandwidth()])
          .padding(0.05);
        this.yScale = d3.scaleLinear()
          .domain([0, d3.max(this.data, d => d[y])]).nice()
          .range([0, width]);
        this.chart.append("g")
          .selectAll()
          .data(d3.group(this.data, d => d[group]))
          .join("g")
          .attr("transform", ([state]) => `translate(0,${this.groupScale(state)})`)
          .selectAll()
          .data(([, d]) => d)
          .join('path')
          .attr("title", (d) => d[group])
          .attr("class", "bar")
          .attr("d", (item) => {
            return (
              "M" +
              0 +
              "," +
              this.xScale(item[x]) +

              " h" +
              (this.yScale(item[y]) - 4) +
              "a3,3 0 0 1 3,3 v " +
              (this.xScale.bandwidth() - 4) +
              " 0 a3,3 0 0 1 -3,3 h-" +
              (this.yScale(item[y]) - 4)
            );
          })
          .attr("fill", (_, i) => {
            var rgb = d3.rgb(color[i % color.length]);
            return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
          }).attr('stroke', (_, i) => {
            return color[i % color.length]
          })

      } else {

        this.groupScale = d3.scaleBand()
          .domain(new Set(this.data.map(d => d[group])))
          .range([0, width])
          .paddingInner(0.1);
        console.log('this.groupScale.bandwidth()', this.groupScale.bandwidth(), width, new Set(this.data.map(d => d[group])))
        this.xScale = d3.scaleBand()
          .domain(new Set(this.data.map(d => d[x])))
          .range([0, this.groupScale.bandwidth()])
          .padding(0.05);
        this.yScale = d3.scaleLinear()
          .domain([0, d3.max(this.data, d => d[y])]).nice()
          .range([height, 0]);

        this.chart.append("g")
          .selectAll()
          .data(d3.group(this.data, d => d[group]))
          .join("g")
          .attr("transform", ([state]) => `translate(${this.groupScale(state)},0)`)
          .selectAll()
          .data(([, d]) => d)
          .join('path')
          .attr("title", (d) => d[group])
          .attr("class", "bar")
          .attr("d", (item) => {
            return (
              "M" +
              this.xScale(item[x]) +
              "," +
              height +
              " v-" +
              (height - this.yScale(item[y]) - 4) +
              "a 3 , 3 0 0 1 3, -3 l " +
              (this.xScale.bandwidth() - 4) +
              " 0 a 3, 3 0 0 1  3, 3 v" +
              (height - this.yScale(item[y]) - 4)
            );
          })

          .attr("fill", (_, i) => {
            var rgb = d3.rgb(color[i % color.length]);
            return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
          }).attr('stroke', (_, i) => {
            return color[i % color.length]
          })

      }

    } else {
      if (horizontal) {
        this.xScale = d3
          .scaleLinear()
          .domain([0, d3.max(this.data, (d) => d[y])])
          .range([0, width])

        this.yScale = d3
          .scaleBand()
          .domain(this.data.map((d) => d[group]))
          .range([0, height])
          .padding(0.1);
        this.chart
          .selectAll("path")
          .data(this.data)
          .enter()
          .append("path")
          .attr("title", (d) => d[group])
          .attr("class", "bar")
          .attr("d", (item) => {
            return (
              "M" +
              0 +
              "," +
              this.yScale(item[group]) +

              " h" +
              (this.xScale(item[y]) - 4) +
              "a3,3 0 0 1 3,3 v " +
              (this.yScale.bandwidth() - 4) +
              " 0 a3,3 0 0 1 -3,3 h-" +
              (this.xScale(item[y]) - 4)
            );
          })
          .attr("fill", (_, i) => {
            var rgb = d3.rgb(color[i % color.length]);
            return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
          }).attr('stroke', (_, i) => {
            return color[i % color.length]
          })
      } else {
        this.xScale = d3
          .scaleBand()
          .domain(this.data.map((d) => d[group]))
          .range([0, width])
          .padding(0.1);

        this.yScale = d3
          .scaleLinear()
          .domain([0, d3.max(this.data, (d) => d[y])])
          .range([height, 0]);
        this.chart
          .selectAll("path")
          .data(this.data)
          .enter()
          .append("path")
          .attr("title", (d) => d[group])
          .attr("class", "bar")
          .attr("d", (item) => {
            return (
              "M" +
              this.xScale(item[group]) +
              "," +
              height +
              " v-" +
              (height - this.yScale(item[y]) - 4) +
              "a 3 , 3 0 0 1 3, -3 l " +
              (this.xScale.bandwidth() - 4) +
              " 0 a 3, 3 0 0 1  3, 3 v" +
              (height - this.yScale(item[y]) - 4)
            );
          })
          .attr("fill", (_, i) => {
            var rgb = d3.rgb(color[i % color.length]);
            return "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", " + (opacity || 1.0) + ")";
          }).attr('stroke', (d, i) => {
            return color[i % color.length]
          })
      }

    }
  }
  applyFeatures() {
    const { height, width, marginY, textColor, opacity, color } = this.chartSetting.style;
    const { chartTitle, axisLabel, hover, grid, legend, group } = this.chartSetting;
    if (axisLabel) {
      // Add the x-axis
      this.chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(this.xScale));
      // Add the y-axis
      this.chart.append("g").call(d3.axisLeft(this.yScale));
    }
    if (legend && group) {
      var legendElement = this.chart.selectAll(".legend")
        .data(this.data)
        .enter().append("foreignObject").attr('x', function (d, i) {
          return i * 75
        })
        .attr('y', function (d) {
          return height + 20
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
        .attr("stroke", (d, i) => {
          return color[i % color.length];
        })
      legendElement.append("text")
        .attr("x", 30)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text((d) => { return d[group]; });
    }
    if (grid) {
      const xGridLines = d3.axisBottom(this.xScale)
        .tickSize(-height)
        .tickFormat('');

      // Y-axis grid lines  
      const yGridLines = d3.axisLeft(this.yScale)
        .tickSize(-width)
        .tickFormat('');
      this.chart.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0, ${height})`)
        .call(xGridLines)
        .selectAll('line')
        .attr('stroke-dasharray', '3, 3')
        .attr('opacity', 0.5);

      this.chart.append('g')
        .attr('class', 'grid')
        .call(yGridLines)
        .selectAll('line')
        .attr('stroke-dasharray', '3, 3')
        .attr('opacity', 0.5);

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
      const bars = document.querySelectorAll(".bar");const tooltip = document.querySelector(".tooltip");const mouseover = function (d) {d.target.setAttribute('style','opacity:0.7')};const mousemove = function (event, d) {tooltip.innerHTML =  '<div style="display:flex;flex-direction:column;padding:4px"><div style="padding:3px;display:flex;flex-direction:row;justify-content:space-between;align-items:center;direction:ltr"><div class="colorbox" style="background-color:' +  event.target.attributes.stroke.value +  '"></div>' +  event.target.attributes.title.value +  "</div></div>";tooltip.setAttribute(  "style",  "top:" + (event.pageY - 10) + "px;left:" + (event.pageX + 80) + "px" + ";opacity:0.8");};const mouseleave = function (d) {tooltip.setAttribute("style", "opacity:0.0");d.target.setAttribute('style','opacity: 1;')};bars.forEach((e) => {e.addEventListener("mousemove", mousemove);e.addEventListener("mouseover", mouseover);e.addEventListener("mouseleave", mouseleave);});`.trim();
      this.dom.body.appendChild(script);
      style.textContent = ` .legend {display: flex;flex-direction: column;justify-content: center;align-items: center;gap: 10px;}  .tooltip {opacity:0.0;top: -5px;left: 105%;margin-left: -60px;position: absolute;font-size: 11px;padding: 4px;border-radius: 5px;color: #fff;border: none;box-shadow: 0px 0px 3px 0px #e6e6e6;background-color: rgba(0, 0, 0, 0.9);}  .colorbox {width: 13px;height: 13px;border: #fff solid 2px;border-radius: 2px;margin-right: 10px;}`;
      this.dom.body.appendChild(style);
    }
    if (textColor) {
      this.chart.selectAll("text").attr("fill", textColor);
    }
  }
}
