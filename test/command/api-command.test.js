import ApiCommand from "../../renderEngine/Command/ApiCommand.js";
import JsonSource from "../../renderEngine/Source/JsonSource.js";

function createContext() {
  const sources = [
    new JsonSource([{ api_base: "https://example.com" }], "cms.host"),
    new JsonSource([{ rkey: "ABC-123" }], "cms.cookie"),
  ];
  return {
    cancellation: { throwIfCancellationRequested() {} },
    tryGetSource(sourceId) {
      return sources.find((source) => source.id === sourceId.toLowerCase()) || null;
    },
  };
}

function dynamicUrl() {
  return [
    {
      Params: [
        { Source: "cms", Member: "host", Column: "api_base" },
        { Value: "https://example.com" },
      ],
    },
    "/api/main/multi-list/",
    { Params: [{ Source: "cms", Member: "cookie", Column: "rkey" }] },
    "?question=list,total",
  ];
}

describe("ApiCommand IL attribute compatibility", () => {
  test("preserves direct API attributes when rendering atclient", async () => {
    const command = new ApiCommand({
      $type: "api",
      core: "api",
      name: "api.booking",
      run: "atclient",
      url: dynamicUrl(),
      method: "post",
      body: '{"name":"db"}',
      "content-type": "application/json",
    });

    const html = (await command.createHtmlElementAsync(createContext())).getHtml();

    expect(html).toContain(
      "url='https://example.com/api/main/multi-list/ABC-123?question=list,total'"
    );
    expect(html).toContain("method='post'");
    expect(html).toContain("content-type='application/json'");
    expect(html).toContain("body='{\"name\":\"db\"}'");
  });

  test.each(["extra-attribute", "extraAttributes"])(
    "supports API attributes under %s",
    async (propertyName) => {
      const command = new ApiCommand({
        $type: "api",
        core: "api",
        name: "api.booking",
        run: "atclient",
        [propertyName]: {
          url: "https://example.com/api/main",
          method: "post",
          "content-type": "application/json",
        },
      });

      const html = (await command.createHtmlElementAsync(createContext())).getHtml();
      expect(html).toContain("url='https://example.com/api/main'");
      expect(html).toContain("method='post'");
      expect(html).toContain("content-type='application/json'");
    }
  );
});
