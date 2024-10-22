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


const il = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [
    {
      $type: "schema",
      core: "schema",
      run: "AtClient",
      "data-member-name": "answer.data",
      "extra-attribute": {
        schemaurl: "https://basispanel.ir/schema/freeform",
        displaymode: "edit",
        button: "[data-btn-edit]",
        triggers: "db.showOrder ",
        resultsourceid: "demo.data",
        qs_state: "استان",
        qs_culture: "fa",
        qs_city: "شهر",
        qs_token: "69701A1A-6C18-4F69-AD05-938CC8CB7E29",
      },
    },
  ],
};

//var l = new RawFaceCollection(il.faces);
//console.log(l);
const command = context.createCommand(il);
//console.log(print);
const result = await command.executeAsync(context);
console.log(result);
