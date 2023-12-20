import ServiceSettings from "../../../models/ServiceSettings.js";
import { HostServiceOptions } from "../../../models/model.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import CommandUtil from "../CommandUtil.js";

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

const il = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [
    {
      $type: "call",
      core: "call",
      FileName: "source.inc",
    },
    {
      $type: "Print",
      "data-member-name": "view.menu",
      "layout-content":
        "<table width='500' border='1' id='@id'><tbody> @child</tbody></table>",
      "else-layout-content": "محصولی موجود نیست",
      faces: [
        {
          name: "face1",
          content: "<tr><td style='color:blue' id='@id'>@name</td></tr>",
        },
      ],
    },
  ],
};

const command = CommandUtil.createCommand(il);
try {
  const result = await command.executeAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
