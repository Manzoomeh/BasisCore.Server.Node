import Status from "../../fileStreamer/Models/Status.js";
import StreamerEngine from "./../../fileStreamer/StreamerEngine.js";
import IStreamerEngineOptions from "../../models/options/IStreamerEngineOptions.js";
import BinaryContent from "../../fileStreamer/Models/BinaryContent.js";
import fs from "fs"
/** @type {IStreamerEngineOptions}*/
let options = {
  DefaultConfigUrl: "F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\StreamerEngine.local-options.json",
  PermissionUrl: "F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\permissions.json",
  ReportUrl: "./report.json",
};
const image = await fs.promises.readFile("F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\example.jpg","binary")
const binaryContent = new BinaryContent();
binaryContent.url = "/test";
binaryContent.name = "testPic.js";
binaryContent.mime = "image/jpeg";
binaryContent._status = Status.NotSet;
binaryContent.payload = image
const streamer = new StreamerEngine(options);
await streamer.processAsync([binaryContent])