import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import DbSource from "../../../renderEngine/Command/Source/DbSource.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

const il = {
  $type: "dbsource",
  core: "dbsource",
  name: "db",
  "extra-attribute": {
    parentid: "0",
    comment: "_comment",
  },
  Members: [
    {
      name: "action",
      "extra-attribute": {
        type: "scalar",
      },
    },
    {
      name: "action1",
      "extra-attribute": {
        type: "scalar",
      },
      postsql: "select id from [db.action1]",
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
        " app",
      ],
    },
  ],
};

const context = new ContextBase();
context.cancellation = new CancellationToken();
context.addSource(new JsonSource([{ comment2: "ali" }], "db.tbl2"));
//context.addSource(new JsonSource([{ comment: "ali" }], "db.tbl1"));

const source = new DbSource(il);
console.log((await source.createHtmlElementAsync(context)).getHtml());
//console.log(print);
//const result = await source.executeAsync(context);
//console.log(result);
