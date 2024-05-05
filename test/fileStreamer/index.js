import Status from "../../fileStreamer/Models/Status.js";
import StreamerEngine from "./../../fileStreamer/StreamerEngine.js";
import IStreamerEngineOptions from "../../models/options/IStreamerEngineOptions.js";
import BinaryContent from "../../fileStreamer/Models/BinaryContent.js";
import fs from "fs"
/** @type {IStreamerEngineOptions}*/
let options = {
  DefaultConfigUrl: "F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\defaultConfig.json",
  PermissionUrl: "F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\config.json",
  ReportUrl: "./report.json",
};
const image = await fs.promises.readFile("F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\example.jpg","binary")
const buffer = Buffer.from(image, 'binary')
const binaryContent = new BinaryContent();
binaryContent.url = "/test";
binaryContent.name = "testPic.jpg";
binaryContent.mime = "image/jpg";
binaryContent._status = Status.NotSet;
binaryContent.payload = buffer
const image2 = await fs.promises.readFile("F:\\AliBazregar\\BasisCore.Server.Node\\test\\fileStreamer\\example2.png","binary")
const buffer2 = Buffer.from(image2, 'binary')
const binaryContent2 = new BinaryContent();
binaryContent2.url = "/test2";
binaryContent2.name = "testPic2.png";
binaryContent2.mime = "image/png";
binaryContent2._status = Status.NotSet;
binaryContent2.payload = buffer2
const streamer = new StreamerEngine(options);
const result= await streamer.processAsync([binaryContent,binaryContent2])
console.log(result)