import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import ViewBCCommand from "../../../renderEngine/Command/ViewBCCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import fs from "fs";
const settings = new ServiceSettings({});
const context = new RequestContext(settings);
context.cancellation = new CancellationToken();

const bcComponentIl = {
  $type: "bcview",
  type: "html",
  core: "bcview",
  html: `
  <Basis
  core="api"
  url="https://basispanel.ir/schema/basiscore/fa/1446403?hashid=E0F910E3-FE30-4F16-804C-C3C5D850EDA7"
  method="get"
  run="atclient"
>
</Basis>
<Basis
  core="schema"
  datamembername="answer.data"
  run="atclient"
  schemaUrl="https://basispanel.ir/schema"
  displayMode="edit"
  triggers="cms.form"
  qs_rkey="1446403?hashid=E0F910E3-FE30-4F16-804C-C3C5D850EDA7"
>
</Basis>
<script>
  var host = {
    sources: {
      "inline.object": [{ id: 1423331 }],
    },
    settings: {
      "default.dmnid": 20,
      "default.call.verb": "get",
      "default.dbsource.verb": "post",
      "default.binding.regex": "\\{##([^#]*)##\\}",
    },
  };
</script>
  

`,
};

const view = new ViewBCCommand(bcComponentIl);
try {
  const result = await view.executeAsync(context);
  fs.writeFileSync("./test.html", result._result);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
