import ApiCommand from "../../../renderEngine/Command/ApiCommand";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken";
import ContextBase from "../../../renderEngine/Context/ContextBase";
import { exec } from "child_process";

let il = {
  $type: "api",
  core: "api",
  name: "api.test",
  runType: "AtServer",
  extraAttributes: {
    url: "http://localhost:3000",
    method: "get",
    contentType: "application/json",
    noCache: "true",
  },
};

describe("api command", () => {
  let appProcess;

  beforeAll((done) => {
    appProcess = exec("node app.js", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting the app: ${error}`);
        done();
      }
    });
  });
  test("get", async () => {
    console.log(1)
    const context = new ContextBase();
    context.cancellation = new CancellationToken();
    const command = new ApiCommand(il);
    await command.executeAsync(context);
    const res = await context.waitToGetSourceAsync("api.test");
    expect(res).toBe(1);
  });
});
