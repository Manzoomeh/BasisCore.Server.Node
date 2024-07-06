import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import TestContext from "../../../renderEngine/Context/testContext.js";
import CommandUtil from "../CommandUtil.js";

var setting = new ServiceSettings({});
const context = new TestContext(setting, 12);
context.cancellation = new CancellationToken();

const unknownCommandIl = {
  $type: "UnknownCommand",
  core: "UnknownCommand",
  name: "Unknown-Command",
};

const command = CommandUtil.createCommand(unknownCommandIl);
try {
  const result = await Promise.all([command.executeAsync(context)]);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
