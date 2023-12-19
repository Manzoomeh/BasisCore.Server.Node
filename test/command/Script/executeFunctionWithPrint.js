import ScriptCommand from "../../../renderEngine/Command/ScriptCommand.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";

import JsonSource from "../../../renderEngine/Source/JsonSource.js";
const context = new ContextBase();
context.cancellation = new CancellationToken();
const scriptIl = {
  $type: "script",
  core: "script",
  name: "script",
  runType: "AtServer",
  language: "javascript",
  content: `  function add(a, b) {

    return Number(a) + Number(b);
  }
  function subtract(a, b){
    return a - b;
  }
 this is a test string
  const divide = (e, f) => {
    return e / f;
  }`,
};

context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
var p = new Promise((r) => {
  setTimeout(() => {
    context.addSource(
      new JsonSource(
        [
          { id: 1, name: "qam1" },
          { id: 2, name: "qam2" },
          { id: 3, name: "qam3" },
        ],
        "products.lego"
      )
    );
  }, 2_000);
});

const il = {
  $type: "Print",
  "data-member-name": "products.lego",
  "layout-content":
    "<table width='500' border='1' id='@id'><tbody><tr> @child</tr></tbody></table>",
  "else-layout-content": "محصولی موجود نیست",
  faces: [
    {
      name: "face1",
      function: true,
      filter : "id=1",
      content:
        "<td style='color:blue' id='@id'><p>--  @name  javascript::add(1,5)<br></td>",
    },
  ],
  "divider-content": "</tr><tr> ",
  "divider-rowcount": 2,
  "incomplete-content": "<td style='color:red'>red</td>",
  replaces: [
    {
      tagname: "i",
      template: "<span style='color:red'>@val1</span>",
    },
  ],
};

//var l = new RawFaceCollection(il.faces);
//console.log(l);
const print = new PrintCommand(il);
const command = new ScriptCommand(scriptIl);

//console.log(print);
const [result,scriptResult] = await Promise.all([
  print.executeAsync(context),command.executeAsync(context)
])
console.log(result);


