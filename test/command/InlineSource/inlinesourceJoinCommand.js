import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../../../renderEngine/Context/TestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";
var setting = new ServiceSettings({});
const context = new TestContext(setting);
context.cancellation = new CancellationToken();
context.addSource(
  new JsonSource(
    [
      { id: 1, name: "John", age: 25, cityId: 1 },
      { id: 2, name: "Alice", age: 30, cityId: 1 },
      { id: 3, name: "Bob", age: 28, cityId: 2 },
      { id: 4, name: "Emma", age: 35, cityId: 2 },
      { id: 5, name: "James", age: 40, cityId: 3 },
      { id: 6, name: "Sophia", age: 22, cityId: 4 },
      { id: 7, name: "Michael", age: 45, cityId: 5 },
      { id: 8, name: "Emily", age: 32, cityId: 6 },
    ],
    "db.users"
  )
);
console.log(1)
context.addSource(
  new JsonSource(
    [
      { id: 1, city: "New York" },
      { id: 2, city: "Los Angeles" },
      { id: 3, city: "Chicago" },
      { id: 4, city: "Houston" },
      { id: 5, city: "Phoenix" },
      { id: 6, city: "Philadelphia" },
      { id: 7, city: "San Antonio" },
      { id: 8, city: "San Diego" },
    ],
    "db.city"
  )
);
const il = {
  $type: "group",
  core: "group",
  Commands: [
    {
      $type: "inlinesource",
      core: "inlinesource",
      name: "join",
      Members: [
        {
          type: "join",
          "left-data-member": "db.users.cityId",
          "right-data-member": "db.city.id",
          jointype: "LeftJoin",
          name: "sss",
        },
      ],
    },
    {
      $type: "Print",
      "data-member-name": "join.sss",
      "layout-content":
        "<table width='500' border='1'><tbody><tr> @child</tr></tbody></table>",
      "else-layout-content": "محصولی موجود نیست",
      "divider-content": "</tr><tr> ",
      "divider-rowcount": 2,
      "incomplete-content": "<td style='color:red'>red</td>",
      faces: [
        {
          name: "face1",
          replace: true,
          function: true,
          content:
            "<td style='color:green' id='usedforid'><p> @db.users.name @db.city.city<br></td>",
        },
      ],
      replaces: [
        {
          tagname: "i",
          content: "<span style='color:red'>@val1</span>",
        },
      ],
    },
  ],
};
const group = new GroupCommand(il);
const groupResult = await group.executeAsync(context);
console.log(groupResult);
