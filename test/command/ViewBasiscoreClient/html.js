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
  url="https://basispanel.ir/schema/fa/3850909?hashid=B507C66A-A731-4D80-B5DD-96A19E772E24"
  method="get"
  run="atclient"
>
</Basis>
<Basis
  core="schema"
  datamembername="answer.data"
  run="atclient"
  schemaUrl="https://basispanel.ir/schema"
  displayMode="view"
  triggers="cms.form"
  qs_rkey="B507C66A-A731-4D80-B5DD-96A19E772E24"
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
