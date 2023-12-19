import ApiCommand from "../../../renderEngine/Command/ApiCommand.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";

const context = new ContextBase();
context.cancellation = new CancellationToken();
const il = {
  $type: "api",
  core: "api",
  name: "api.test",
  runType: "AtServer",
  extraAttributes: {
    url: "http://localhost:3000",
    method: "get",
    contentType: "application/json",
    noCache : "true"
  },
};
const command = new ApiCommand(il)
await command.executeAsync(context)
const res = await context.waitToGetSourceAsync("api.test")
console.log(res,res.data[0].content)
// console.log(context)


