import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../../../renderEngine/Context/TestContext.js";

var setting = new ServiceSettings({});
const context = new TestContext(setting);
context.cancellation = new CancellationToken();

const groupIl = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [
    {
      $type: "inlinesource",
      core: "inlinesource",
      name: "basisName",
      Members: [
        {
          name: "memberName",
          content:
            '\r\n <row fieldName1="test1" fieldName2="1-2" fieldName3="fieldName3-1" />\r\n <row fieldName1="test2" fieldName2="2-2" fieldName3="fieldName3-2" />\r\n <row fieldName1="test3" fieldName2="3-2" fieldName3="fieldName3-3" />\r\n <row fieldName1="test4" fieldName2="4-2" fieldName3="fieldName3-4" />\r\n <row fieldName1="test5" fieldName2="5-2" fieldName3="fieldName3-5" />\r\n ',
        },
      ],
    },
    {
      $type: "repeater",
      core: "repeater",
      name: "testRepeat",
      "data-member-name": "basisName.memberName",
      Commands: [
        {
          $type: "rawtext",
          core: "rawtext",
          content: [
            "repeaterTest :(",
            {
              Params: [
                {
                  Source: "testRepeat",
                  Member: "current",
                  Column: "fieldName1",
                },
              ],
            },
            ")************",
          ],
        },
        {
          $type: "print",
          core: "print",
          "data-member-name": "basisName.memberName",
          "layout-content": "\r\n <ul>\r\n @child\r\n </ul>\r\n ",
          faces: [
            {
              content:
                "\r\n <li> @fieldName1 (@fieldName2) - (@fieldName3) </li>\r\n ",
            },
          ],
        },
      ],
    },
  ],
};

const group = new GroupCommand(groupIl);
try {
  const result = await group.executeAsync(context);
  console.log("%%%%%%%%:",result._results[1]);
} catch (ex) {
  console.error(ex);
}
