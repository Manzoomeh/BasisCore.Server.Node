import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";
import DbSource from "../../../renderEngine/Command/Source/DbSource.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

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

context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
context.addSource(new JsonSource([{ comment2: "ali" }], "db.tbl2"));

const printIl = {
  $type: "Print",
  "data-member-name": "db.print",
  "layout-content":
    "<table width='500' border='1' id='@id'><tbody><tr> @child</tr></tbody></table>",
  "else-layout-content": "محصولی موجود نیست",
  faces: [
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "even",
      filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    },
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "odd",
      filter: "id<=2",
      template:
        "<td style='color:blue-odd' id='@id'>[(i)5|@id]<p>--  @name<br></td>",
    },
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "even",
      filter: "id>2",
      template: "<td style='color:green' id='@id'><p>--  @name<br></td>",
    },
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "odd",
      template: "<td style='color:blue' id='@id'><p>  @name<br></td>",
    },
    {
      name: "face1",
      replace: true,
      function: true,
      "row-type": "odd",
      template: "<td style='color:green' id='@id'><p>  @name<br></td>",
    },
  ],
  "divider-content": "</tr><tr> ",
  "divider-rowcount": 2,
  "incomplete-content": "<td style='color:red'>red</td>",
  replaces: [
    {
      tagname: "i",
      template: "<span style='color:red'>@val1 - @val2</span>",
    },
  ],
};

const dbSourceIl = {
  $type: "dbsource",
  core: "dbsource",
  name: "db",
  source: "source1",
  "extra-attribute": {
    parentid: "0",
    comment: "_comment",
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
    {
      name: "print",
      "extra-attribute": {
        type: "print",
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

const print = new PrintCommand(printIl);
const dbSource = new DbSource(dbSourceIl);
try {
  const result = await Promise.all([
    print.executeAsync(context),
    dbSource.executeAsync(context),
  ]);

  console.log(result);
} catch (ex) {
  console.error(ex);
}
