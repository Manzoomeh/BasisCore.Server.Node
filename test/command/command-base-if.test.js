import CommandBase from "../../renderEngine/Command/CommandBase.js";
import JsonSource from "../../renderEngine/Source/JsonSource.js";

function createContext(rows = null) {
  const source = rows ? new JsonSource(rows, "db.runBuyer") : null;
  return {
    cancellation: { throwIfCancellationRequested() {} },
    tryGetSource(sourceId) {
      return source && sourceId.toLowerCase() === source.id ? source : null;
    },
    async waitToGetSourceAsync() {
      return null;
    },
  };
}

describe("CommandBase server-side if compatibility", () => {
  test("resolves a legacy client token before evaluating an atserver if", async () => {
    const command = new CommandBase({
      core: "group",
      if: "{##db.runBuyer.run|(false)##}",
    });

    await expect(
      command._getIfValueAsync(createContext([{ run: true }]))
    ).resolves.toBe(true);
  });

  test("uses the legacy token fallback when its source is absent", async () => {
    const command = new CommandBase({
      core: "group",
      if: "{##db.runBuyer.run|(false)##}",
    });

    await expect(command._getIfValueAsync(createContext())).resolves.toBe(false);
  });

  test("resolves legacy tokens embedded in a comparison", async () => {
    const command = new CommandBase({
      core: "group",
      if: "'{##db.runBuyer.run|(no)##}' = 'yes'",
    });

    await expect(
      command._getIfValueAsync(createContext([{ run: "yes" }]))
    ).resolves.toBe(true);
  });
});
