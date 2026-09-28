import fs from "fs";
import os from "os";
import path from "path";
import HostManager from "../hostManager.js";
import StaticFileService from "../Services/staticFileHostService.js";

describe("file service isolation", () => {
  let root;
  let outside;

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "basiscore-file-"));
    outside = fs.mkdtempSync(path.join(os.tmpdir(), "basiscore-outside-"));
    fs.writeFileSync(path.join(root, "index.html"), "<h1>Home</h1>");
    fs.mkdirSync(path.join(root, "nested"));
    fs.writeFileSync(path.join(root, "nested", "index.html"), "<h1>Nested</h1>");
    fs.writeFileSync(path.join(outside, "secret.txt"), "private");
    fs.symlinkSync(path.join(outside, "secret.txt"), path.join(root, "linked.txt"));
  });

  afterAll(() => {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  });

  function service() {
    return new StaticFileService("files", root, { Type: "file", Settings: { Directory: root } });
  }

  async function result(instance, url) {
    return (await instance.processAsync({ Url: url, request: { url } }, [])).getResultAsync();
  }

  test("serves static files and directory indexes", async () => {
    const files = service();
    expect((await result(files, "/"))[2].toString()).toBe("<h1>Home</h1>");
    expect((await result(files, "/nested/?v=1"))[2].toString()).toBe("<h1>Nested</h1>");
  });

  test("rejects traversal and symlinks outside the root", async () => {
    const files = service();
    for (const url of ["/../secret.txt", "/%2e%2e/secret.txt", "/linked.txt"]) {
      expect((await result(files, url))[0]).toBe(404);
    }
  });

  test("does not generate panel routes in the npm file service", async () => {
    const files = service();
    for (const url of ["/runtime-config.js", "/dmntoken-v3.inc", "/server/trust/getDmnToken"]) {
      expect((await result(files, url))[0]).toBe(404);
    }
  });

  test("returns 404 when the configured directory is not present yet", async () => {
    const missingRoot = path.join(root, "not-created");
    const files = new StaticFileService("files", missingRoot, {
      Type: "file",
      Settings: { Directory: missingRoot },
    });
    expect((await result(files, "/"))[0]).toBe(404);
  });

  test("selects the generic implementation at startup", () => {
    const config = { Services: {}, EndPoints: {} };
    const fileConfig = { files: { Type: "file", Settings: { Directory: root } } };
    expect(HostManager.fromJson(config).loadServices(fileConfig)[0]).toBeInstanceOf(StaticFileService);
  });
});
