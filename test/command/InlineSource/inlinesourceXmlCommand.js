import alasql from "alasql";
import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../../../renderEngine/Context/TestContext.js";
var setting = new ServiceSettings({});
const context = new TestContext(setting);
context.cancellation = new CancellationToken();

const il = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [
    {
      $type: "inlinesource",
      core: "inlinesource",
      name: "db",
      Members: [
        {
          name: "routelist",
          type: "xml",
          content:
            "\r\n <note>\r\n <to>Tove</to>\r\n <from>Jani</from>\r\n <heading>Reminder</heading>\r\n <body>Don't forget me this weekend!</body>\r\n </note>\r\n ",
        },
      ],
    },
    {
      $type: "print",
      core: "print",
      "data-member-name": "db.routelist",
      faces: [
        {
          name: "face1",
          replace: true,
          function: true,
          content: "<td style='color:green' id='@RowNumber'><p> @Value<br></td>",
        },
      ],
    },
  ],
};
const group = new GroupCommand(il);
const groupResult = await group.executeAsync(context);
console.log(groupResult);
