import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";
import RawFaceCollection from "../../../renderEngine/Command/Renderable/RawFaceCollection.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import TestContext from "../../../renderEngine/Context/testContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";
import CommandUtil from "../../../renderEngine/CommandUtil.js";
import ServiceSettings from "../../../models/ServiceSettings.js";
const context = new TestContext(
  new ServiceSettings({}),
  1234,
  CommandUtil.addDefaultCommands()
);
context.cancellation = new CancellationToken();
context.addSource(new JsonSource([{ dmntoken: "ttttdggdgg" }], "db.dmntoken"));

const il = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [
    {
      $type: "rawtext",
      core: "rawtext",
      content: [
        '{"dmnToken": "',
        { Params: [{ Source: "db", Member: "dmntoken", Column: "dmnToken" }] },
        '"}',
      ],
    },
  ],
};

//var l = new RawFaceCollection(il.faces);
//console.log(l);
const command = context.createCommand(il);
//console.log(print);
const result = await command.executeAsync(context);
console.log(result);
