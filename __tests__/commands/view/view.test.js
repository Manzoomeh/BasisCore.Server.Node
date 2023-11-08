import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import ViewCommand from "../../../renderEngine/Command/ViewCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

var setting = new ServiceSettings({});
const context = new RequestContext(setting);
context.cancellation = new CancellationToken();

context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
context.addSource(new JsonSource([{ id: 1, name: "ali", lastname: "bazregar" },
{ id: 2, name: "mohsen", lastname: "rezaee" },
{ id: 3, name: "abolfazl", lastname: "jelodar" },], "test"));

