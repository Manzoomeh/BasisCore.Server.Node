import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import ChartCommand from "../../../renderEngine/Command/Chart/ChartCommand.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
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
`,
    },
  ],
};
const chartIl = {
  $type: "chart",
  core: "chart",
  "data-member-name": "chart.data",
  "layout-content": "<div>@child</div >",
  chartType: "halfdonut",
  group: "column",
  y: "y",
  chartTitle: "chart title",
  hover: 'true', axisLabel: true,
  chartStyle: {
    backgroundColor: "#ffffff",
    width: 800,
    height: 400,
    marginY: 40,
    marginX: 40, color: ["#004B85", "#FF7A00", "#00A693", "#B40020"],
    opacity: 0.2,
    textColor: "blue",
  },
};
const db = new InlineSourceCommand(il);
await db.executeAsync(context);
const chart = new ChartCommand(chartIl);
console.log(await chart.executeAsync(context));
