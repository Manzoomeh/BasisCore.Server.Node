import ServiceSettings from "../../../models/ServiceSettings.js";
import { HostServiceOptions } from "../../../models/model.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import CallCommand from "../../../renderEngine/Command/Collection/CallCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";

/** @type {HostServiceOptions} */
const options = {
  Type: "http",
  Settings: {
    "Connections.sql.CallCommand": {
      connectionString:
        "Server=.;Database=Manzoomeh-node;User Id=sa;Password=1234;trustServerCertificate=true",
      procedure: "[dbo].[SbCallProcedure]",
    },
  },
};
var setting = new ServiceSettings(options);
const context = new RequestContext(setting);
context.cancellation = new CancellationToken();

const callIl = {
  $type: "call",
  core: "call",
  FileName: "simple.inc",
};

const call = new CallCommand(callIl);
try {
  const result = await call.callAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
