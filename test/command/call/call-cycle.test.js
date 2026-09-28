import { jest } from "@jest/globals";
import CallCommand from "../../../renderEngine/Command/Collection/CallCommand.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";

function callIl(fileName, overrides = {}) {
  return {
    $type: "call",
    core: "call",
    FileName: fileName,
    ...overrides,
  };
}

function groupIl(commands) {
  return {
    $type: "group",
    core: "group",
    Commands: commands,
  };
}

function createContext(pages) {
  const context = {
    cancellation: {
      throwIfCancellationRequested() {},
    },
    debugContext: {
      newStep() {
        return {
          complete() {},
          failed() {},
        };
      },
    },
    createCommand(il) {
      if (il.$type === "call") {
        return new CallCommand(il);
      }
      if (il.$type === "group") {
        return new GroupCommand(il);
      }
      return { type: il.$type };
    },
  };

  context.loadPageAsync = jest.fn(async (pageName) => {
    const il = pages[pageName];
    if (!il) {
      throw new Error(`Missing test page '${pageName}'`);
    }
    return context.createCommand(il);
  });

  return context;
}

describe("CallCommand cycle detection", () => {
  test("prunes a direct self-call without throwing", async () => {
    const context = createContext({
      "header.inc": groupIl([callIl("header.inc")]),
    });

    await expect(
      new CallCommand(callIl("header.inc")).callAsync(context)
    ).resolves.toEqual([]);
    expect(context.loadPageAsync).toHaveBeenCalledTimes(1);
  });

  test("prunes an indirect call cycle without throwing", async () => {
    const context = createContext({
      "a.inc": callIl("b.inc"),
      "b.inc": callIl("a.inc"),
    });

    await expect(
      new CallCommand(callIl("a.inc")).callAsync(context)
    ).resolves.toEqual([]);
    expect(context.loadPageAsync).toHaveBeenCalledTimes(2);
  });

  test("keeps sibling content around a pruned recursive include", async () => {
    const context = createContext({
      "header.inc": groupIl([
        { $type: "before" },
        callIl("header.inc"),
        { $type: "after" },
      ]),
    });

    await expect(
      new CallCommand(callIl("header.inc")).callAsync(context)
    ).resolves.toEqual([{ type: "before" }, { type: "after" }]);
  });

  test("allows repeated sibling includes after each call returns", async () => {
    const context = createContext({
      "page.inc": groupIl([
        callIl("shared.inc"),
        callIl("shared.inc"),
      ]),
      "shared.inc": { $type: "rawtext" },
    });

    const result = await new CallCommand(
      callIl("page.inc")
    ).callAsync(context);

    expect(result).toHaveLength(2);
    expect(context.loadPageAsync.mock.calls.map(([name]) => name)).toEqual([
      "page.inc",
      "shared.inc",
      "shared.inc",
    ]);
  });

  test("allows the same page to call itself with a different call tag", async () => {
    let loadCount = 0;
    const context = createContext({
      "header.inc": { $type: "rawtext" },
    });
    context.loadPageAsync.mockImplementation(async () => {
      loadCount += 1;
      return loadCount === 1
        ? context.createCommand(
            callIl("header.inc", { pagesize: "mobile" })
          )
        : context.createCommand({ $type: "rawtext" });
    });

    const result = await new CallCommand(
      callIl("header.inc", { pagesize: "desktop" })
    ).callAsync(context);

    expect(result).toEqual([{ type: "rawtext" }]);
    expect(context.loadPageAsync).toHaveBeenCalledTimes(2);
  });

  test("prunes a non-repeating chain at the maximum depth", async () => {
    const pages = {};
    for (let index = 0; index <= 30; index += 1) {
      pages[`page-${index}.inc`] = callIl(`page-${index + 1}.inc`);
    }
    const context = createContext(pages);

    await expect(
      new CallCommand(callIl("page-0.inc")).callAsync(context)
    ).resolves.toEqual([]);
    expect(context.loadPageAsync).toHaveBeenCalledTimes(30);
  });
});
