import JsonSource from "../../renderEngine/Source/JsonSource.js";
import SourceUtil from "../../renderEngine/Source/SourceUtil.js";

describe("SourceUtil legacy postsql", () => {
  test.each(['"result"', "'result'"])(
    "normalizes the quoted alias %s",
    (alias) => {
      const source = new JsonSource(
        [{ result: "{'msg': 'no data'}" }],
        "db.hotelsearch"
      );

      SourceUtil.applySql(
        source,
        `select replace(result, "None", "null") as ${alias} from [db.hotelsearch]`
      );

      expect(source.data).toEqual([{ result: "{'msg': 'no data'}" }]);
      expect(source.columns).toEqual(["result"]);
    }
  );
});
