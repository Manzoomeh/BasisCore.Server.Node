import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import DbSource from "../../../renderEngine/Command/Source/DbSource.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";

const hostOptions = {
  Type: "mongodb",
  ReadBodyTimeOut: 6000000,
  ProcessTimeout: 1000000,
  IsActive: true,
  MaxBodySize: 102400000,
  MaxMultiPartSize: 1024000000,
  Settings: {
    CallMaxDepth: 1,
    "Connections.mongodb.findProducts": {
      endpoint: "mongodb://127.0.0.1:27017",
      dataBase: "mydatabase",
      collection: "test",
      method: "find",
      query: {},
    },
  },
};
var setting = new ServiceSettings(hostOptions);
let il = {
  $type: "dbsource",
  core: "dbsource",
  name: "test",
  source: "findProducts",
  "extra-attribute": {
    parentid: "0",
  },
  Members: [
    {
      name: "test",
      "extra-attribute": {
        type: "list",
        run: "atClient",
      },
    },
  ],
};
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    const source = new DbSource(il);
    await source.executeAsync(context);
    const result = await context.waitToGetSourceAsync("test.test");
    console.log(result);