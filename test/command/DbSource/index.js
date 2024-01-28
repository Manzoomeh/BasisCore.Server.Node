import ServiceSettings from "../../../models/ServiceSettings.js";
import { HostServiceOptions } from "../../../models/model.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import DbSource from "../../../renderEngine/Command/Source/DbSource.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

const il = {
  $type: "dbsource",
  core: "dbsource",
  name: "db",
  ConnectionName: "Source1",
  "extra-attribute": {
    parentid: "0",
    comment: "_comment",
    comment1: {
      Params: [
        {
          Source: "cms",
          Member: "query",
          Column: "id",
        },
        {
          Value: "666",
        },
      ],
    },
  },
  Members: [
    {
      name: "memberName",
      "extra-attribute": {
        type: "list",
        request: "test_request",
      },
      postsql: "select v,t from [db.memberName]",
      sort: "v asc",
    },
    {
      name: "memberName1",
      "extra-attribute": {
        type: "view",
        request: "test_request",
      },
    },
  ],
  Params: [
    {
      name: "comment",
      value: {
        Params: [
          {
            Source: "db",
            Member: "tbl1",
            Column: "comment",
          },
          {
            Value: "none",
          },
        ],
      },
    },
    {
      name: "comment1",
      value: [
        "my ",
        {
          Params: [
            {
              Source: "db",
              Member: "tbl2",
              Column: "comment2",
            },
          ],
        },
        "app",
      ],
    },
  ],
};
/** @type {HostServiceOptions} */
var hostOptions = {
  Type: "sql",
  ReadBodyTimeOut: 6000000,
  ProcessTimeout: 1000000,
  IsActive: true,
  MaxBodySize: 102400000,
  MaxMultiPartSize: 1024000000,
  Settings: {
    LibPath: "D:\\Programming\\Falsafi\\WebServer\\commands",
    CallMaxDepth: 1,
    "Connections.sql.RoutingData": {
      connectionString:
        "Server=.;Database=temp;User Id=sa;Password=1234;trustServerCertificate=true",
      procedure: "[dbo].[DBSourceProcedure]",
      requestTimeout: 2000,
      testTimeOut: 1000,
    },
    "Connections.sql.CallCommand": {
      connectionString:
        "Server=.;Database=temp;User Id=sa;Password=1234;trustServerCertificate=true",
      procedure: "[dbo].[DBSourceProcedure]",
    },
    "Connections.sql.ILUpdate": {
      connectionString:
        "Server=.;Database=temp;User Id=sa;Password=1234;trustServerCertificate=true",
      procedure: "[dbo].[DBSourceProcedure]",
    },
    "Connections.sql.source1": {
      connectionString:
        "Server=.;Database=temp;User Id=sa;Password=1234;trustServerCertificate=true",
      procedure: "[dbo].[DBSourceProcedure]",
    },
  },
};
var setting = new ServiceSettings(hostOptions);
const context = new RequestContext(setting);
context.cancellation = new CancellationToken();
context.addSource(new JsonSource([{ comment2: "ali" }], "db.tbl2"));
// const command = `<basis core="dbsource" source="basiscore" name="basisName" >
// <member type="list" name="memberName" request="test_request"/>
// <member type="view" name="memberName" request="test_request"/>
// </basis>`;
// const params = {
//   command: command,
//   dmnid: 123,
// };
// var data = await context.loadDataAsync("qam", "routingdata", params);
// console.dir(data);
//context.addSource(new JsonSource([{ comment: "ali" }], "db.tbl1"));

const source = new DbSource(il);
//console.log((await source.createHtmlElementAsync(context)).getHtml());
console.log(await source.executeAsync(context));
//console.log(print);
//const result = await source.executeAsync(context);
//console.log(result);
