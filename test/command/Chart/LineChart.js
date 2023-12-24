import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import ChartCommand from "../../../renderEngine/Command/Chart/ChartCommand.js";

const context = new ContextBase();
context.cancellation = new CancellationToken();

const il = {
  $type: "inlinesource",
  core: "inlinesource",
  name: "chart",
  Members: [
    {
      name: "data",
      preview: "true",
      content: `<row x="0"  y="3" column='male'/> 
        <row x="1"  y="1"  column='male'/>
        <row x="2"  y="8"  column='male'/>
        <row x="3"  y="6" column='male'/>
        <row x="4"  y="7"  column='male'/>
       <row x="5"  y="4" column='male'/>
       <row x="0"  y="5" column='female'/> 
        <row x="1"  y="2"  column='female'/>
        <row x="2"  y="2"  column='female'/>
        <row x="3"  y="1" column='female'/>
        <row x="4"  y="4"  column='female'/>
       <row x="5"  y="6" column='female'/>
       `,
    },
  ],
};
const chartIl = {
  $type: "chart",
  core: "chart",
  "data-member-name": "chart.data",
  "layout-content": "<div>@child</div >",
  setting: {
    //available chart types : line | bar
    chartType: "line",
    columnKey: "column",
    xKey: "x",
    yKey: "y",
    chartTitle: "chart title",
    axisLabel: true,
    style: {
      backgroundColor: "#ffffff",
      width: 800,
      height: 400,
      marginY: 40,
      marginX: 40,
      textColor: "blue",
    },
    hover: true,
  },
};
const db = new InlineSourceCommand(il);
await db.executeAsync(context);
const chart = new ChartCommand(chartIl);
console.log(await chart.executeAsync(context));
