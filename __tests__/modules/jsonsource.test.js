import JsonSource from "../../renderEngine/Source/JsonSource";
import ContextBase from "../../renderEngine/Context/ContextBase.js";
import CancellationToken from "../../renderEngine/Cancellation/CancellationToken.js";

let array = [
  { id: 1, name: "ali", lastname: "bazregar" },
  { id: 2, name: "mohsen", lastname: "rezaee" },
  { id: 3, name: "abolfazl", lastname: "jelodar" },
  { id: 4, name: "mehdi", lastname: "zarei" },
  { id: 5, name: "mohammad", lastname: "bakhtiari" },
  { id: 6, name: "naser" },
];
describe("testing json source with context", () => {
  test("return nothing when source name is invalid", async () => {
    const context = new ContextBase();
    context.cancellation = new CancellationToken();
    context.addSource(new JsonSource(array, "clients.names"));

    const result = context.tryGetSource("view.menu");
    expect(result).toBe(null);
  });
  test("return nothing  when source name is correct but no data is added", async () => {
    const context = new ContextBase();
    context.cancellation = new CancellationToken();
    context.addSource(new JsonSource([], "clients.names"));

    const result = context.tryGetSource("clients.names");
    expect(result.data).toEqual([]);
  });
  test("return data when source name is valid", async () => {
    const context = new ContextBase();
    context.cancellation = new CancellationToken();
    context.addSource(new JsonSource(array, "clients.names"));

    const result = context.tryGetSource("view.menu");
    expect(result).toBe(null);
  });
  test("check when everything was correct the data should not be null", async () => {
    const context = new ContextBase();
    context.cancellation = new CancellationToken();
    context.addSource(new JsonSource(array, "clients.names"));

    const result = context.tryGetSource("clients.names");
    expect(result.data).not.toBe(null);
  });
  test("check source name is correct or not", async () => {
    const context = new ContextBase();
    context.cancellation = new CancellationToken();
    context.addSource(new JsonSource(array, "clients.names"));

    const result = context.tryGetSource("clients.names");
    expect(result.id).toBe("clients.names");
    expect(result.type).toBe("Json");
  });
  test("check when everything was correct the data should show the data", async () => {
    const context = new ContextBase();
    context.cancellation = new CancellationToken();
    context.addSource(new JsonSource(array, "clients.names"));

    const result = context.tryGetSource("clients.names");
    expect(result.data).toEqual(array);
  });
});
describe("test jsonSource without contextBase", () => {
  test("when json source id is empty throws an error", () => {
    expect(() => new JsonSource([])).toThrow();
  });
  test("when json source id is empty throws an error case 2", () => {
    expect(() => new JsonSource()).toThrow();
  });
  test("when json source id is correct dosent throws an error ", () => {
    expect(() => new JsonSource(array, "test1.test1")).not.toThrow();
  });
  test("when json source id is correct dosent throws an error and data is not null ", () => {
    const source = new JsonSource(array, "test1.test1");
    expect(source.data).not.toEqual(null);
  });
  test("when json source id is correct function show data", () => {
    const source = new JsonSource(array, "test1.test1");
    expect(source.data).toEqual(array);
  });
  test("when json source id is correct dosent throws an error and data is not null ", () => {
    const source = new JsonSource(array, "test1.test1");
    expect(source.columns).toEqual(["id", "name", "lastname"]);
  });
    test("when json source id is correct dosent throws an error and data is not null ", () => {
    const source = new JsonSource(array, "test1.test1");
    expect(source.id).toEqual("test1.test1");
  });
    test("when json source id is correct dosent throws an error and data is not null ", () => {
    const source = new JsonSource(array, "test1.test1");
    expect(source.type).toEqual("Json");
  });

});
