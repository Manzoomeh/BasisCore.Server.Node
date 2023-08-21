import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

const context = new ContextBase();

context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
var p = new Promise((r) => {
  setTimeout(() => {
    context.addSource(new JsonSource([{ id: 1, data: "qam" }], "test2"));
  }, 2_000);
});

const il = {
  $type: "Print",
  "data-member-name": "products.lego",
  layout:
    "<table width='500' border='1' id='@id'><tbody><tr> @child</tr></tbody></table>",
  "else-layout": "محصولی موجود نیست",
  faces: [
    {
      name: "face1",

      replace: true,
      function: true,
      "row-type": "even",
      filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    },
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "odd",
      filter: "id<=2",
      template: "<td style='color:green' id='@id'><p>--  @name<br></td>",
    },
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "even",
      template: "<td style='color:blue' id='@id'><p>  @name<br></td>",
    },
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "odd",
      template: "<td style='color:green' id='@id'><p>  @name<br></td>",
    },
  ],
  "divider-template": "</tr><tr> ",
  "divider-rowcount": 3,
  "incomplete-template": "<td style='color:red'>red</td>",
  replaces: [
    {
      tagname: "i",
      template: "<span style='color:red'>@val1</span>",
    },
  ],
};

const print = new PrintCommand(il);
console.log(print);
const result = await print.executeAsync(context);
console.log(result);
