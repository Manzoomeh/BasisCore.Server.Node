import ContextBase from "../../renderEngine/Context/ContextBase.js";
import JsonSource from "../../renderEngine/Source/JsonSource.js";
import ObjectToken from "../../renderEngine/Token/ObjectToken.js";
import SimpleTokenElement from "../../renderEngine/Token/SimpleTokenElement.js";
import ValueToken from "../../renderEngine/Token/ValueToken.js";

const context = new ContextBase();

let t1 = new ValueToken("hi");
console.log("val1", await t1.getValueAsync(context));
context.addSource(
  new JsonSource([{ id: "qam", data: "ali" }], "source1.member1")
);
const te1 = new SimpleTokenElement("source1", "member1", "id", null);
const te2 = new SimpleTokenElement(null, null, null, "12");
t1 = new ObjectToken([te1, te2]);
console.log("val2", await t1.getValueAsync(context));

// console.log("start");
// let c1 = context.tryGetSource("test1");
// console.log("c1:", c1);
// context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
// c1 = context.tryGetSource("test1");
// console.log("c1:", c1);
// var p = new Promise((r) => {
//   setTimeout(() => {
//     context.addSource(new JsonSource([{ id: 1, data: "qam" }], "test2"));
//   }, 2_000);
// });
// const c2 = await context.waitToGetSourceAsync("test2");
// console.log("c2:", c2);
