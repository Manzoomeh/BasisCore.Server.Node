import StringUtil from "../../renderEngine/Token/StringUtil.js";

describe("StringUtil structured values", () => {
  test("preserves object arrays as valid JSON", () => {
    const value = [{ room: [{ title: "adult 1" }] }];

    const output = StringUtil.format(
      "<div data-output='{0}'></div>",
      [value]
    );

    expect(output).toBe(
      `<div data-output='${JSON.stringify(value)}'></div>`
    );
    expect(JSON.parse(output.match(/data-output='([^']+)'/)[1])).toEqual(
      value
    );
  });

  test("preserves empty arrays as valid JSON", () => {
    expect(StringUtil.formatValue([])).toBe("[]");
  });

  test("keeps the legacy comma-separated scalar array format", () => {
    expect(StringUtil.formatValue(["one", "two"])).toBe("one,two");
  });
});
