import ServiceSettings from "../../../models/ServiceSettings";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand";
import TreeCommand from "../../../renderEngine/Command/TreeCommand";
import RequestContext from "../../../renderEngine/Context/RequestContext";
import JsonSource from "../../../renderEngine/Source/JsonSource";

const settings = new ServiceSettings({});
const context = new RequestContext(settings);
context.cancellation = new CancellationToken();

const dataArray = [
  {
    id: 1,
    parentid: 0,
    name: "Object 1",
    value: 10,
    description: "This is Object 1",
  },
  {
    id: 2,
    parentid: 1,
    name: "Object 2",
    value: 20,
    description: "This is Object 2",
  },
  {
    id: 3,
    parentid: 1,
    name: "Object 3",
    value: 30,
    description: "This is Object 3",
  },
  {
    id: 4,
    parentid: 2,
    name: "Object 4",
    value: 40,
    description: "This is Object 4",
  },
  {
    id: 5,
    parentid: 2,
    name: "Object 5",
    value: 50,
    description: "This is Object 5",
  },
  {
    id: 6,
    parentid: 3,
    name: "Object 6",
    value: 60,
    description: "This is Object 6",
  },
  {
    id: 7,
    parentid: 3,
    name: "Object 7",
    value: 70,
    description: "This is Object 7",
  },
  {
    id: 8,
    parentid: 4,
    name: "Object 8",
    value: 80,
    description: "This is Object 8",
  },
  {
    id: 9,
    parentid: 5,
    name: "Object 9",
    value: 90,
    description: "This is Object 9",
  },
  {
    id: 10,
    parentid: 6,
    name: "Object 10",
    value: 100,
    description: "This is Object 10",
  },
];
context.addSource(new JsonSource(dataArray,"test.data"));

const treeIl = {
  $type: "tree",
  core: "tree",
  "data-member-name": "test.data",
  "null-value": "00",
  "principal-key": "id",
  "foreign-key": "parentid",
  "layout-content": '<ul class="menu">@child</ul>',
  faces: [],
};

describe("tree command", () => {
  afterEach(() => {
    treeIl.faces = [];
  });
  test("shows string in result",async () => {
    treeIl.faces = [
      {
        level: "end",
        content: "<li><a>@name</a></li><li><p>@description</p>",
      },
      {
        content: `<li><a>@name</a><ul>@child</ul></li>`,
      },
    ];
    const view = new TreeCommand(treeIl);
    const result = await view.executeAsync(context);
    expect(
      typeof
       result._result).toBe("string");
  });
    test("shows string in result", async () => {
      treeIl.faces = [
        // {
        //   level: "end",
        //   content: "<li><a>@name</a></li><li><p>@description</p>",
        // },
        {
          level: "1",
          content: `<li><a>@name</a><ul>@child</ul></li>`,
        },
        {
          level: "2",
          content: `<li><a>@name</a><ul></ul></li>`,
        },
        // {
        //   level: "4",
        //   content: `<li><a>@name</a><ul>@child</ul></li>`,
        // },
      ];
      const view = new TreeCommand(treeIl);
      const result = await view.executeAsync(context);
      expect(result._result).toBe();
    });
});
