import ScriptCommand from "../../../renderEngine/ScriptCommand.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";

const context = new ContextBase();
context.cancellation = new CancellationToken();
const il = {
  $type: "script",
  core: "script",
  name: "script",
  runType: "AtServer",
  language: "javascript",
  content: `  function add(a, b) {
    return a + b;
  }
  const subtract = (a, b) => {
    return a - b;
  }
 this is a test string
  const divide = (e, f) => {
    return e / f;
  }`,
};
const command = new ScriptCommand(il);
await command.executeAsync(context);
console.log(context);
const res = await context.executeFunction("add", 1, 2);
console.log(res);
const res1 = await context.executeFunction("subtract", 1, 2);
console.log(res1);
const res2 = await context.executeFunction("divide", 1, 2);
console.log(res2);
