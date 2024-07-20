import * as d3 from "d3";

export default class LineChart {
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
  /**@type {d3.ScaleLinear|d3.scaleBand} */
  xScale;
  /** @type {d3.ScaleLinear} */

  yScale;
  constructor(data, chartSetting, chart, dom) {
    this.data = data;
    this.chart = chart;
    this.chartSetting = chartSetting;
    this.script = "";

    this.dom = dom;
  }
  renderChart() {
    const { x, y, group } = this.chartSetting;
    const { width, height, thickness, curveTension } = this.chartSetting.style;
    this.xScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, (d) => d[x]))
      .range([0, width]);

    this.yScale = d3
      .scaleLinear()
      .domain(d3.extent(this.data, (d) => d[y]))
      .range([height, 0]);
    const line = d3
      .line()
      .x((d) => this.xScale(d[x]))
      .y((d) => this.yScale(d[y]))
      .curve(d3.curveCardinal.tension(curveTension || 1));
    if (!group) {

      this.chart
        .append("path")
        .datum(this.data)
        .attr("title", (d) => {
          return d[x];
        })
        .attr("stroke-width", `${thickness || 2}px`)

        .attr("d", line)
        .attr("class", "line")
        .style("fill", "none")
        .attr("stroke", (_, i) => {
          return this.color[i % this.color.length];
        });
    } else {
      const aggregatedData = d3.group(this.data, (d) => d[group]);

      this.chart
        .selectAll(".line")
        .data(aggregatedData)
        .join("path")
        .attr("title", (d) => {
          return d[0];
        })
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke-width", `${thickness || 2}px`)
        .attr("d", (d) => line(d[1]))

        .attr("stroke", (_, i) => {
          return this.color[i % this.color.length];
        });
    }
  }
  applyFeatures() {
    const { height, width, marginY, textColor } = this.chartSetting.style;
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
      this.chart.selectAll('.grid').selectAll('text').remove()

    }
    if (legend && group) {
      if (group) {
        const aggregatedData = d3.group(this.data, (d) => d[group]);

        var legendElement = this.chart.selectAll(".legend")
          .data(aggregatedData)
          .enter().append("foreignObject").attr('x', function (_, i) {
            return i * 75
          })
          .attr('y', function () {
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
          .style("fill", (d, i) => this.color[i % this.color.length])

        legendElement.append("text")
          .attr("x", 30)
          .attr("y", 10)
          .attr("dy", ".35em")
          .text((d) => { return d[0]; });
      }

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
      const lines = document.querySelectorAll(".line");const tooltip = document.querySelector(".tooltip");const mouseover = function (d) {d.target.setAttribute('style','opacity:0.7')};const mousemove = function (event, d) {tooltip.innerHTML =  '<div style="display:flex;flex-direction:column;padding:4px"><div style="padding:3px;display:flex;flex-direction:row;justify-content:space-between;align-items:center;direction:ltr"><div class="colorbox" style="background-color:' +  event.target.attributes.stroke.value +  '"></div>' +  event.target.attributes.title.value +  "</div></div>";tooltip.setAttribute(  "style",  "top:" + (event.pageY - 10) + "px;left:" + (event.pageX + 80) + "px" + ";opacity:0.8");};const mouseleave = function (d) {tooltip.setAttribute("style", "opacity:0.0");d.target.setAttribute('style','opacity: 1;')};lines.forEach((e) => {e.addEventListener("mousemove", mousemove);e.addEventListener("mouseover", mouseover);e.addEventListener("mouseleave", mouseleave);});`.trim();
      this.dom.body.appendChild(script);
      style.textContent = `.legend {display: flex;flex-direction: column;justify-content: center;align-items: center;gap: 10px;}  .tooltip {opacity:0.0;top: -5px;left: 105%;margin-left: -60px;position: absolute;font-size: 11px;padding: 4px;border-radius: 5px;color: #fff;border: none;box-shadow: 0px 0px 3px 0px #e6e6e6;background-color: rgba(0, 0, 0, 0.9);}  .colorbox {width: 13px;height: 13px;border: #fff solid 2px;border-radius: 2px;margin-right: 10px;}`;
      this.dom.body.appendChild(style);
    }
    if (textColor) {
      this.chart.selectAll("text").style("color", textColor);
    }
  }
}
