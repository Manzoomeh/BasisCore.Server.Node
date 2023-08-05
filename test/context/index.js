import ContextBase from "../../renderEngine/Context/ContextBase.js";
import JsonSource from "../../renderEngine/Source/JsonSource.js";

const context = new ContextBase();

console.log("start");
let c1 = context.tryGetSource("test1");
console.log("c1:", c1);
context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
c1 = context.tryGetSource("test1");
console.log("c1:", c1);
var p = new Promise((r) => {
  setTimeout(() => {
    context.addSource(new JsonSource([{ id: 1, data: "qam" }], "test2"));
  }, 2_000);
});
const c2 = await context.waitToGetSourceAsync("test2");
console.log("c2:", c2);
