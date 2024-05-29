import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../../../renderEngine/Context/TestContext.js";

const settings = new ServiceSettings({LibPath : "F:\\AliBazregar\\BasisCore.Server.Node\\renderEngine\\Command"});
const context = new TestContext(settings);
context.cancellation = new CancellationToken();

const rawTextIl = {
  type: "group",
  core: "group",
  Commands: [{ $type: "rawtext", core: "group", content: "<h1>hi<h1>" }],
};

const rawText = new GroupCommand(rawTextIl);
console.log(rawText);
try {
  const result = await rawText.executeAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
