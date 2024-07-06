import ServiceSettings from "../Models/ServiceSettings.js";
import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../renderEngine/Context/testContext.js";

let groupIl = null;
describe("Cookie Command Test(s)", () => {
  beforeAll(() => {
    groupIl = {
      $type: "group",
      core: "group",
      name: "ROOT_GROUP",
      Commands: [],
    };
  });
  test("Run at client", async () => {
    const setting = new ServiceSettings({});
    const context = new TestContext(setting);
    context.cancellation = new CancellationToken();
    groupIl.Commands.push({
      $type: "cookie",
      core: "cookie",
      name: "rkey",
      path: "/",
      value: "",
      "extra-attribute": {
        triggers: "user.rkey",
        onrendered: "onRenderedCookie",
      },
      run: "atclient",
    });
    const group = new GroupCommand(groupIl);
    const result = await group.executeAsync(context);
    expect(result._results[0]).toEqual();
  });
});
