import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../../../renderEngine/Context/TestContext.js";

var setting = new ServiceSettings({
  Settings: {
    "Connections.Socket.mydbsource": {
      endPoint: "127.0.0.1:9090",
    },
  },
});
const context = new TestContext(setting);
context.cancellation = new CancellationToken();

const groupIl = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [
    {
      $type: "external.ws.ws",
      core: "external.ws.ws",
      name: "saman",
      ConnectionName: "mydbsource",
      Members: [
        {
          name: "m1",
          method: "RequestToken",
          sort: "random",
          content:
            '\r\n <params>\r\n <param name="MID" value="12413287" />\r\n <param name="ResNum" value="555" />\r\n <param name="Amount" value="0" />\r\n <param name="SegAmount1" value="0" />\r\n <param name="SegAmount2" value="0" />\r\n <param name="SegAmount3" value="0" />\r\n <param name="SegAmount4" value="0" />\r\n <param name="SegAmount5" value="0" />\r\n <param name="SegAmount6" value="0" />\r\n <param name="AdditionalData1" value="basiscore" />\r\n <param name="AdditionalData2" value="fingerfood" />\r\n <param name="Wage" value="0" />\r\n <param name="RedirectUrl" value=""/> \r\n </params>\r\n ',
        },
      ],
    },
  ],
};

const group = new GroupCommand(groupIl);
try {
  const result = await group.executeAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
