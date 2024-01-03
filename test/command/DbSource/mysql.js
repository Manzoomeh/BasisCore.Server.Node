import DbSource from "../../../renderEngine/Command/Source/DbSource.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
const hostOptions = {
  Type: "mongodb",
  ReadBodyTimeOut: 6000000,
  ProcessTimeout: 1000000,
  IsActive: true,
  MaxBodySize: 102400000,
  MaxMultiPartSize: 1024000000,
  Settings: {
    //this is right now not implemented
    LibPath: "D:\\Programming\\Falsafi\\WebServer\\commands",
    CallMaxDepth: 1,
    "Connections.mysql.findProduct": {
      host: "127.0.0.1",
      user: "root",
      password: "09177283475",
      database: "test-ab",
      procedure: "getAllProducts",
    },
  },
};
var setting = new ServiceSettings(hostOptions);
let il = {
  $type: "dbsource",
  core: "dbsource",
  name: "test",
  source: "findProduct",
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
