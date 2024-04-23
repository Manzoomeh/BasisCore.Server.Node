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
          name: "token",
          type: "json",
          preview: "true",
          content:
            '{"root":{"value": 1234,"bool": true,"str" :"sss" , "arr" : [1,"sss", true,null]}}',
        },
      ],
    },
  ],
};
const group = new GroupCommand(il);
const groupResult = await group.executeAsync(context);
console.log(groupResult);
