import ServiceSettings from "../../models/ServiceSettings.js";
import RequestContext from "../../renderEngine/Context/RequestContext.js";
import GroupCommand from "../../renderEngine/Command/Collection/GroupCommand.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";

var setting = new ServiceSettings({});
const context = new RequestContext(setting);
context.cancellation = new CancellationToken();

const groupIl = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [
    {
      $type: "RawText",
      content: [
        "<h1>",
        {
          Params: [
            {
              Source: "basisName",
              Member: "memberName1",
              Column: "fieldName3",
            },
          ],
        },
        "</h1>",
      ],
    },
    {
      $type: "inlinesource",
      core: "inlinesource",
      name: "basisName",
      Members: [
        {
          name: "memberName",
          content: `
            <row fieldName1="test21" fieldName2="21-2" fieldName3="fieldName23-1" /> 
            <row fieldName1="test22" fieldName2="22-2" fieldName3="fieldName23-2" /> 
            <row fieldName1="test23" fieldName2="23-2" fieldName3="fieldName23-3" /> 
            <row fieldName1="test24" fieldName2="24-2" fieldName3="fieldName23-4" /> 
            <row fieldName1="test25" fieldName2="25-2" fieldName3="fieldName23-5" />`,
        },
        {
          name: "memberName1",
          content: `
            <row fieldName1="test31" fieldName2="31-2" fieldName3="fieldName33-1" /> `,
        },
      ],
    },
  ],
};

const group = new GroupCommand(groupIl);
try {
  const result = await group.executeAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
