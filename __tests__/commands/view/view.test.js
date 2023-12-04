import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import Member from "../../../renderEngine/Command/Source/BaseClasses/Member.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import ViewCommand from "../../../renderEngine/Command/ViewCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

var setting = new ServiceSettings({});
const context = new RequestContext(setting);
context.cancellation = new CancellationToken();
function extractValuesFromTable(htmlString) {
  const tdRegex = /<td.*?>(.*?)<\/td.*?>/g;
  const extractedValues = [];

  let match;
  while ((match = tdRegex.exec(htmlString)) !== null) {
    extractedValues.push(match[1].trim());
  }

  return extractedValues;
}
context.addSource(
  new JsonSource(
    [{ data: "hello my friend" }, { data: "i want to tell you something" }],
    "test.sentences"
  )
);
let userDetails = [
  { id: 1, key: "name", value: "abolfazl", prpid: 124 },
  { id: 2, key: "lastname", value: "jelodar", prpid: 345 },
  { id: 3, key: "job", value: "web developer", prpid: 346 },
  { id: 4, key: "address", value: "qom", prpid: 347 },
  { id: 4, key: "age", value: "25", prpid: 348 },
];
context.addSource(new JsonSource(userDetails, "test.employees"));

let viewIl = {
  $type: "view",
  core: "view",
  "data-member-name": "test.employees",
  GroupColumn: "prpid",
  "layout-content":
    '<table border="1" width="600" dir="rtl"  >@child</table  >',
  faces: [],
};

describe("view command tests", () => {
  beforeEach(() => {
    viewIl.faces = [];
    viewIl["data-member-name"] = "test.employees";
  });
  test("when no prpid is not in data return null in result", async () => {
    viewIl["data-member-name"] = "test.sentences";
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@data</td  ><td  >     
      </td  ></tr  >`,
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
    expect(result._result).toBe(null);
  });
  test("view command should have a string result", async () => {
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@key</td  >@child<td  >
      </td  ></tr  >`,
      },
      {
        level: "2",
        content: "@value,",
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
    expect(typeof result._result).toBe("string");
  });
  test("result element should included all parts in order", async () => {
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@key</td  >@child<td  >
      </td  ></tr  >`,
      },
      {
        level: "2",
        content: "@value,",
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
    expect(extractValuesFromTable(result._result)).toStrictEqual([
      "name",
      "lastname",
      "job",
      "address",
      "age",
    ]);
  });

  for (let member of userDetails) {
    test("expect to have all key and values part " + member, async () => {
      viewIl.faces = [
        {
          level: "1",
          content: `<tr  ><td width="200"  >@key</td  >@child<td  >
      </td  ></tr  >`,
        },
        {
          level: "2",
          content: "@value,",
        },
      ];
      const view = new ViewCommand(viewIl);
      const result = await view.executeAsync(context);
      expect(result._result.includes(member.key)).toBe(true);
      expect(result._result.includes(member.value)).toBe(true);
    });
  }

  for (let member of userDetails) {
    test("when the child face isnt there code should not show anything from child", async () => {
      viewIl.faces = [
        {
          level: "1",
          content: `<tr  ><td width="200"  >@key</td  >@child<td  ></td  ></tr  >`,
        },
      ];
      const view = new ViewCommand(viewIl);
      const result = await view.executeAsync(context);
      expect(result._result.includes(member.key)).toBe(true);
      expect(result._result.includes(member.value)).toBe(false);
    });
    test("expect to have data in specefic format", async () => {
      viewIl.faces = [
        {
          level: "1",
          content: `<tr  ><td width="200"  >@key</td  ><td  ></td  ></tr  >`,
        },
      ];
      const view = new ViewCommand(viewIl);
      const result = await view.executeAsync(context);
      expect(
        result._result.includes(
          `<tr  ><td width="200"  >${member.key}</td  ><td  ></td  ></tr  >`
        )
      ).toBe(true);
    });
  }
  test("check filter in face for view in prpid", async () => {
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@key</td  ><td  ></td  ></tr  >`,
        filter: "prpid=124",
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
    expect(result._result).toBe(
      '<table border="1" width="600" dir="rtl"  ><tr  ><td width="200"  >name</td  ><td  ></td  ></tr  ></table  >'
    );
  });
  test("check filter in face for filtering strings", async () => {
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@key</td  ><td  ></td  ></tr  >`,
        filter: `[value]="qom"`,
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
      ;
      expect(result._result).toBe('<table border="1" width="600" dir="rtl"  ><tr  ><td width="200"  >address</td  ><td  ></td  ></tr  ></table  >');
  });
  test("return null when none of data have the condition of filter", async () => {
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@key</td  ><td  ></td  ></tr  >`,
        filter: `prpid=4044040`,
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
    expect(result._result).toBe(null);
  });
  test("check filter in face for filtering strings using LIKE", async () => {
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@key</td  ><td  ></td  ></tr  >`,
        filter: `[value] LIKE 'q%'`,
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
    expect(result._result).toBe(
      '<table border="1" width="600" dir="rtl"  ><tr  ><td width="200"  >address</td  ><td  ></td  ></tr  ></table  >'
    );
  });

  test("check filter in face for filtering strings using multi faces", async () => {
    viewIl.faces = [
      {
        level: "1",
        content: `<tr  ><td width="200"  >@key</td  >@child<td  >
      </td  ></tr  >`,
        filter: `[value]="qom"`,
      },
      {
        level: "2",
        content: "@value,",
        filter: `[value]="qom"`,
      },
    ];
    const view = new ViewCommand(viewIl);
    const result = await view.executeAsync(context);
    expect(result._result.split(" ").join("")).toBe(
      `<table border="1" width="600" dir="rtl"  ><tr  ><td width="200"  >address</td  >qom,<td  >
      </td  ></tr  ></table  >`
        .split(" ")
        .join("")
    );
  });
});
