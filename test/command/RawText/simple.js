import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import RawText from "../../../renderEngine/Command/RawText.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import TreeCommand from "../../../renderEngine/Command/TreeCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

const settings = new ServiceSettings({});
const context = new RequestContext(settings);
context.cancellation = new CancellationToken();

const rawTextIl = {
  $type: "rawtext",
  content: "<h1>hi<h1>",
};

const rawText = new RawText(rawTextIl);
try {
  const result = await rawText.executeAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
