import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";
import RawFaceCollection from "../../../renderEngine/Command/Renderable/RawFaceCollection.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import TestContext from "../../../renderEngine/Context/testContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";
import CommandUtil from "../../../renderEngine/CommandUtil.js";
import ServiceSettings from "../../../models/ServiceSettings.js";
const context = new TestContext(new ServiceSettings({}),1234,CommandUtil.addDefaultCommands())
context.cancellation = new CancellationToken();

context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
var p = new Promise((r) => {
  setTimeout(() => {
    context.addSource(
      new JsonSource([
            {
              "id": 1,
              "prpid": "PRP001",
              "name": "Project Alpha",
              "description": "A cutting-edge AI project focused on language processing. [(img)|1043165600051001B]",
              "status": "In Progress",
              "startDate": "2024-01-15",
              "endDate": "2024-06-30"
            },
            {
              "id": 2,
              "prpid": "PRP002",
              "name": "Project Beta",
              "description": "A renewable energy initiative for solar panel optimization. [(img)|1043165600051001B]",
              "status": "Completed",
              "startDate": "2023-03-01",
              "endDate": "2023-12-15"
            },
            {
              "id": 3,
              "prpid": "PRP003",
              "name": "Project Gamma",
              "description": "Blockchain integration in supply chain management.",
              "status": "On Hold",
              "startDate": "2023-07-10",
              "endDate": "2024-01-20"
            },
            {
              "id": 4,
              "prpid": "PRP004",
              "name": "Project Delta",
              "description": "Virtual reality platform for educational purposes.",
              "status": "In Progress",
              "startDate": "2024-02-05",
              "endDate": "2024-09-15"
            },
            {
              "id": 5,
              "prpid": "PRP005",
              "name": "Project Epsilon",
              "description": "Cybersecurity enhancements for financial systems.",
              "status": "Completed",
              "startDate": "2023-01-12",
              "endDate": "2023-11-30"
            },
            {
              "id": 6,
              "prpid": "PRP006",
              "name": "Project Zeta",
              "description": "Developing advanced machine learning algorithms.",
              "status": "In Progress",
              "startDate": "2024-03-20",
              "endDate": "2024-12-01"
            },
            {
              "id": 7,
              "prpid": "PRP007",
              "name": "Project Eta",
              "description": "Next-gen healthcare data analytics platform.",
              "status": "Planned",
              "startDate": "2024-05-15",
              "endDate": "2025-02-28"
            },
            {
              "id": 8,
              "prpid": "PRP008",
              "name": "Project Theta",
              "description": "Autonomous vehicle navigation system development.",
              "status": "In Progress",
              "startDate": "2024-04-01",
              "endDate": "2024-11-15"
            },
            {
              "id": 9,
              "prpid": "PRP009",
              "name": "Project Iota",
              "description": "Smart agriculture solutions using IoT sensors.",
              "status": "On Hold",
              "startDate": "2023-08-15",
              "endDate": "2024-03-30"
            },
            {
              "id": 10,
              "prpid": "PRP010",
              "name": "Project Kappa",
              "description": "AI-powered personal assistant for productivity.",
              "status": "Completed",
              "startDate": "2024-01-10",
              "endDate": "2024-07-15"
            }
          ]  
        ,
        "projects.data"
      )
    );
  }, 2_000);
});

const il = {
  $type: "Print",
  "data-member-name": "projects.data",
  "layout-content":
    "<table width='500' border='1' id='@id'><tbody><tr> @child</tr></tbody></table>",
  "else-layout-content": "محصولی موجود نیست",
  faces: [
    {
      name: "face1",
      replace: true,
      function: true,
      filter: "id=2",
      content : "hi my id is @id desc : @description"
    },
  ],
  "divider-content": "</tr><tr> ",
  "divider-rowcount": 2,
  "incomplete-content": "<td style='color:red'>red</td>",
  Replaces: [
    {
      tagname: "i",
      template: "<span style='color:red'>@val1</span>",
    },
    {
      tagname: "img",
      content:
        '\r\n <p class="show_article">\r\n <img src="/@val2" alt="@val3" class="@val4" style="display:block;margin:15px auto">\r\n </p>\r\n ',
    },
  ],
};

//var l = new RawFaceCollection(il.faces);
//console.log(l);
const print = new PrintCommand(il);
//console.log(print);
const result = await print.executeAsync(context);
console.log(result);
