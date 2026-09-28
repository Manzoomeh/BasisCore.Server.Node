import TokenUtil from "../../renderEngine/Token/TokenUtil.js";
import JsonSource from "../../renderEngine/Source/JsonSource.js";

function createContext(form) {
  const source = new JsonSource([form], "cms.form");
  return {
    cancellation: {
      throwIfCancellationRequested() {},
    },
    tryGetSource(sourceId) {
      return sourceId.toLowerCase() === "cms.form" ? source : null;
    },
  };
}

describe("ObjectToken structured form values", () => {
  test("serializes cms.form.rooms as JSON instead of [object Object]", async () => {
    const rooms = [{ adultcount: 2, childcountandage: "" }];
    const token = TokenUtil.ToToken({
      Params: [
        { Source: "cms", Member: "form", Column: "rooms" },
        { Value: "[]" },
      ],
    });

    await expect(token.getValueAsync(createContext({ rooms }))).resolves.toBe(
      JSON.stringify(rooms)
    );
  });

  test("continues to stringify scalar cms.form values", async () => {
    const token = TokenUtil.ToToken({
      Params: [
        { Source: "cms", Member: "form", Column: "cityid" },
        { Value: "0" },
      ],
    });

    await expect(
      token.getValueAsync(createContext({ cityid: 100103 }))
    ).resolves.toBe("100103");
  });
});

describe("legacy cms.json source", () => {
  test("resolves the generated rooms header", async () => {
    const header = '{"rooms":[{"adultcount":"2","childcountandage":"0"}]}';
    const source = new JsonSource([{ header }], "cms.json");
    const context = {
      cancellation: { throwIfCancellationRequested() {} },
      tryGetSource(sourceId) {
        return sourceId.toLowerCase() === "cms.json" ? source : null;
      },
    };
    const token = TokenUtil.ToToken({
      Params: [
        { Source: "cms", Member: "json", Column: "header" },
        { Source: "cms", Member: "form", Column: "roomSearch" },
      ],
    });

    await expect(token.getValueAsync(context)).resolves.toBe(header);
  });
});
