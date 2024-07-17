import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import ChartCommand from "../../../renderEngine/Command/Chart/ChartCommand.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import VoidContext from "../../../renderEngine/Context/VoidContext.js";
import util from 'util'
import fs from 'fs'

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
      content: `<row  x="Chrome"  y="250" group="2024-07-06" /> 
 <row  x="Firefox"  y="195" group="2024-07-06" /> 
 <row  x="Android"  y="647" group="2024-07-06" /> 
 <row  x="Chrome"  y="377" group="2024-07-07" />
  <row  x="Firefox"  y="352" group="2024-07-07" />
   <row  x="Android"  y="647" group="2024-07-07" />
`,
    },
  ],
};

const chartIl = {
  $type: "chart",
  core: "chart",
  "data-member-name": "chart.data",
  "layout-content": "<div>@child</div >",
  chartType: "bar",
  group: "group",
  y: "y",
  x: "x",
  chartTitle: "chart title", horizontal: 'true',
  axisLabel: 'true', grid: 'true', legend: 'true',
  chartStyle: {
    backgroundColor: "#ffffff",
    width: 800,
    height: 400,
    marginY: 40,
    marginX: 40,
    textColor: "blue", opacity: 0.2
  },
  hover: 'true',
};
const db = new InlineSourceCommand(il);
await db.executeAsync(context);
const chart = new ChartCommand(chartIl);
const html = await chart.executeAsync(context)

fs.writeFile('my-file.html', html._result, (err) => {
  if (err) {
    console.error('Error writing to file:', err);
  } else {
    console.log('HTML file created successfully!');
  }
});
console.log(html);
