import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import ChartCommand from "../../../renderEngine/Command/Chart/ChartCommand.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import fs from "fs";
import VoidContext from "../../../renderEngine/Context/VoidContext.js";
const context = new ContextBase(null, null, new VoidContext());
context.cancellation = new CancellationToken();

const il = {
  $type: "inlinesource",
  core: "inlinesource",
  name: "chart",
  Members: [
    {
      name: "data",
      preview: "true",
      content: `<row column="january"  y="3" /> 
        <row column="february"  y="1"  />
        <row column="march"  y="8"  />
        <row column="april"  y="6" />
        <row column="may"  y="7"  />
       <row column="june"  y="4" />`,
    },
  ],
};
const chartIl = {
  $type: "chart",
  core: "chart",
  "data-member-name": "chart.data",
  "layout-content": "<div>@child</div >",
  chartType: "funnel",
  group: "column",
  y: "y",
  chartTitle: "chart title",
  axisLabel: 'true', legend: 'true',
  chartStyle: {
    backgroundColor: "#ffffff",
    width: 800,
    height: 400,
    marginY: 40,
    marginX: 40,
    opacity: 0.2,
  },
  hover: 'true',
};
const db = new InlineSourceCommand(il);
await db.executeAsync(context);
const chart = new ChartCommand(chartIl);
const res = await chart.executeAsync(context);
console.log(res);
fs.writeFileSync("test.html", res._result);
