import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import ViewBCCommand from "../../../renderEngine/Command/ViewBCCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";

const settings = new ServiceSettings({});
const context = new RequestContext(settings);
context.cancellation = new CancellationToken();

const bcComponentIl = {
  $type: "bcview",
  type: "json",
  core: "bcview",
  html: `
    <Basis
      core="api"
      url="http://localhost:3000/schema/answers?id={##inline.object.id##}"
      method="get"
      run="atclient"
    >
    </Basis>
    <Basis
      core="schema"
      datamembername="answer.data"
      run="atclient"
      schemaUrl="http://localhost:3000/schema/questions"
      displayMode="view"
      triggers="cms.form"
      qs_rkey="123"
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
  <

`,
};
console.log("objectt");
const view = new ViewBCCommand(bcComponentIl);
try {
  const result = await view.executeAsync(context);
  console.log(result);
} catch (ex) {
  console.error(ex);
}
