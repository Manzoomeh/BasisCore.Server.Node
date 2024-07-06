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
      $type: "group",
      core: "group",
      Commands: [
        {
          $type: "inlinesource",
          core: "inlinesource",
          name: "basisName",
          Members: [
            {
              name: "memberName",
              content: `<row fieldName1="test01" fieldName2="01-2" fieldName3="fieldName03-1" /> 
                <row fieldName1="test02" fieldName2="02-2" fieldName3="fieldName03-2" />
                <row fieldName1="test03" fieldName2="03-2" fieldName3="fieldName03-3" />
                <row fieldName1="test04" fieldName2="04-2" fieldName3="fieldName03-4" />
                <row fieldName1="test05" fieldName2="05-2" fieldName3="fieldName03-5" />`,
            },
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
    {
      $type: "group",
      core: "group",
      Commands: [
        {
          $type: "inlinesource",
          core: "inlinesource",
          name: "basisName",
          Members: [
            {
              name: "memberName",
              content: `<row fieldName1="test11" fieldName2="11-2" fieldName3="fieldName13-1" /> 
                <row fieldName1="test12" fieldName2="12-2" fieldName3="fieldName13-2" /> 
                <row fieldName1="test13" fieldName2="13-2" fieldName3="fieldName13-3" /> 
                <row fieldName1="test14" fieldName2="14-2" fieldName3="fieldName13-4" /> 
                <row fieldName1="test15" fieldName2="15-2" fieldName3="fieldName13-5" />`,
            },
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
};

const group = new GroupCommand(groupIl);
try {
  const result = await group.executeAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
