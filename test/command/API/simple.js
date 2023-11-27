import ApiCommand from "../../../renderEngine/Command/Api.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";

const context = new ContextBase();
context.cancellation = new CancellationToken();
const il = {
  $type: "api",
  core: "api",
  name: "test",
  runType: "atServer",
  extraAttributes: {
    url: "http://localhost:3000",
    method: "get",
    contentType: "application/json",
    noCache : "true"
  },
};
const command = new ApiCommand(il)
await command.executeAsync(context)
const res = await context.waitToGetSourceAsync("test")
console.log(res)
// console.log(context)


