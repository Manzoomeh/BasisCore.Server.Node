import  PrintCommand from "../renderEngine/Command/PrintCommand.js";
import ContextBase from "../renderEngine/Context/ContextBase.js";
import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import JsonSource from "../renderEngine/Source/JsonSource.js";

function checkOrder(mainString, firstString, secondString) {
  const firstIndex = mainString.indexOf(firstString);
  if (firstIndex === -1) {
    return false;
  }
  const secondIndex = mainString.indexOf(
    secondString,
    firstIndex + firstString.length
  );
  return secondIndex !== -1;
}

//   faces: [
// {
//   name: "face1",
//   replace: true,
//   function: true,
//   // "row-type": "even",
//   // filter: "id<=2",
//   template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
// },
// {
//   name: "face1",
//   replace: true,
//   function: true,
//   "row-type": "odd",
//   filter: "id<=2",
//   template:
//     "<td style='color:blue-odd' id='@id'>[(i)5]<p>--  @name<br></td>",
// },
// {
//   name: "face1",
//   replace: true,
//   function: true,
//   "row-type": "even",
//   filter: "id>2",
//   template: "<td style='color:green' id='@id'><p>--  @name<br></td>",
// },
// {
//   name: "face1",
//   replace: true,
//   function: true,
//   "row-type": "odd",
//   template: "<td style='color:blue' id='@id'><p>  @name<br></td>",
// },
// {
//   name: "face1",
//   replace: true,
//   function: true,
//   "row-type": "odd",
//   template: "<td style='color:green' id='@id'><p>  @name<br></td>",
// },
//   ],

const il = {
  $type: "Print",
  "data-member-name": "clients.names",
  "layout-content":
    "<table width='500' border='1' id='@id'><tbody><tr> @child</tr></tbody></table>",
  "else-layout-content": "محصولی موجود نیست",
  "divider-content": "</tr><tr> ",
  "divider-rowcount": 2,
  "incomplete-content": "<td style='color:red'>red</td>",
  faces: [],
  replaces: [
    {
      tagname: "i",
      template: "<span style='color:red'>@val1</span>",
    },
  ],
};
const context = new ContextBase();
context.cancellation = new CancellationToken();
describe("Print command when have data", () => {
  beforeAll(() => {
    var p = new Promise((r) => {
      context.addSource(
        new JsonSource(
          [
            { id: 1, name: "ali", lastname: "bazregar" },
            { id: 2, name: "mohsen", lastname: "rezaee" },
            { id: 3, name: "abolfazl", lastname: "jelodar" },
            { id: 4, name: "mehdi", lastname: "zarei" },
            { id: 5, name: "mohammad", lastname: "bakhtiari" },
            { id: 6, name: "naser" },
          ],
          "clients.names"
        )
      );
    });
  });
  afterEach(() => {
    il.faces = [];
  });
  test("result must have string type", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "even",
      // filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
 
    const result = await print.executeAsync(context);

    expect(typeof result._result).toBe("string");
  });
  test("result must </tr><tr> have devider", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "even",
      // filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);

    expect(result._result.split("</tr><tr>").length).toBe(3);
  });
  test("unfiltered result must have all expressions", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "even",
      // filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(
      result._result.match(
        /<td style='color:blue' id='\d+'><p>--  \w+<br><\/td>/g
      ).length
    ).toBe(6);
  });
  test("check first one to be ali", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "even",
      // filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);

    expect(
      result._result.match(/<td[^>]*\sid='(\d+)'><p>--\s+(\w+)<br><\/td>/)[1]
    ).toBe("1");
    expect(
      result._result.match(/<td[^>]*\sid='(\d+)'><p>--\s+(\w+)<br><\/td>/)[2]
    ).toBe("ali");
  });
  test("result change by the odd row-types", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      "row-type": "odd",
      // filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });

    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    const includedStrings = ["ali", "mohammad", "abolfazl"];
    const excludedStrings = ["mohsen", "mehdi", "naser"];

    includedStrings.forEach((str) => {
      expect(result._result).toContain(str);
    });

    excludedStrings.forEach((str) => {
      expect(result._result).not.toContain(str);
    });
  });
  test("result change by the even row-types", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      "row-type": "even",
      // filter: "id<=2",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });

    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    const includedStrings = ["mohsen", "mehdi", "naser"];
    const excludedStrings = ["ali", "mohammad", "abolfazl"];

    includedStrings.forEach((str) => {
      expect(result._result).toContain(str);
    });

    excludedStrings.forEach((str) => {
      expect(result._result).not.toContain(str);
    });
  });

  test("result change when i filter id = 3", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id=3",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });

    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    const includedStrings = ["abolfazl"];
    const excludedStrings = ["ali", "mohsen", "mehdi", "naser", "mohammad"];

    includedStrings.forEach((str) => {
      expect(result._result).toContain(str);
    });
    expect(result._result).toContain(
      "<td style='color:blue' id='3'><p>--  abolfazl<br></td>"
    );
    excludedStrings.forEach((str) => {
      expect(result._result).not.toContain(str);
    });
  });
  test("result change when i filter id <4", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id<4",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });

    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    const includedStrings = ["ali", "mohsen", "abolfazl"];
    const excludedStrings = ["mehdi", "naser", "mohammad"];

    includedStrings.forEach((str) => {
      expect(result._result).toContain(str);
    });
    excludedStrings.forEach((str) => {
      expect(result._result).not.toContain(str);
    });
  });
  test("result change when i filter id>3", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id>3",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });

    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    const includedStrings = ["mehdi", "naser", "mohammad"];
    const excludedStrings = ["ali", "mohsen", "abolfazl"];

    includedStrings.forEach((str) => {
      expect(result._result).toContain(str);
    });
    excludedStrings.forEach((str) => {
      expect(result._result).not.toContain(str);
    });
  });
  test("check order when we have one face", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id<3",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });
    let firstTag = "<td style='color:blue' id='1'><p>--  ali<br></td>";
    let secondTag = "<td style='color:blue' id='2'><p>--  mohsen<br></td>";
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(checkOrder(result._result, firstTag, secondTag)).toBe(true);
    expect(checkOrder(result._result, secondTag, firstTag)).toBe(false);
  });
  test("check else layout when the filter has no occures", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id>1000",
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toBe("محصولی موجود نیست");
  });
  test("check replace command in one expression", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id<2",
      template: "<td style='color:blue' id='@id'>[(i)6]<p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toBe(
      "<table width='500' border='1' id='@id'><tbody><tr> <td style='color:blue' id='1'><span style='color:red'>6</span><p>--  ali<br></td></tr></tbody></table>"
    );
  });
  test("dont replace when there is no match", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id<2",
      template: "<td style='color:blue' id='@id'>[(k)5]<p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toBe(
      "<table width='500' border='1' id='@id'><tbody><tr> <td style='color:blue' id='1'>[(k)5]<p>--  ali<br></td></tr></tbody></table>"
    );
  });
  test("replace when there are two matches", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      filter: "id<2",
      template:
        "<td style='color:blue' id='@id'>[(i)5][(i)6]<p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toBe(
      "<table width='500' border='1' id='@id'><tbody><tr> <td style='color:blue' id='1'><span style='color:red'>5</span><span style='color:red'>6</span><p>--  ali<br></td></tr></tbody></table>"
    );
  });
  test("replace when there are two matches in multi datas", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      //filter: "id<2",
      template:
        "<td style='color:blue' id='@id'>[(i)5][(i)6]<p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(
      result._result.match(
        /<td style='color:blue' id='\d+'><span style='color:red'>(5|6)<\/span><span style='color:red'>(5|6)<\/span><p>--\s+\w+<br><\/td>/g
      ).length
    ).toBe(6);
  });
  test("replace when there are two matches in multi datas", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      // "row-type": "odd",
      //filter: "id<2",
      template:
        "<td style='color:blue' id='@id'>[(i)5][(i)6]<p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(
      result._result.match(
        /<td style='color:blue' id='\d+'><span style='color:red'>(5|6)<\/span><span style='color:red'>(5|6)<\/span><p>--\s+\w+<br><\/td>/g
      ).length
    ).toBe(6);
  });
});

describe("multi faces conditions", () => {
  beforeAll(() => {
    var p = new Promise((r) => {
      context.addSource(
        new JsonSource(
          [
            { id: 1, name: "ali", lastname: "bazregar" },
            { id: 2, name: "mohsen", lastname: "rezaee" },
            { id: 3, name: "abolfazl", lastname: "jelodar" },
            { id: 4, name: "mehdi", lastname: "zarei" },
            { id: 5, name: "mohammad", lastname: "bakhtiari" },
            { id: 6, name: "naser" },
          ],
          "clients.names"
        )
      );
    });
  });
  afterEach(() => {
    il.faces = [];
  });
  test("check which multi faces applies in specefic condition; first condition should be applied only", async () => {
    il.faces.push(
      {
        name: "face1",
        //replace: true,
        function: true,
        //"row-type": "even",
        filter: "id<2",
        template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
      },
      {
        name: "face1",
        //  replace: true,
        function: true,
        //"row-type": "odd",
        filter: "id<2",
        template: "<td style='color:blue-odd' id='@id'><p>--  @name<br></td>",
      }
    );
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toContain(
      "<td style='color:blue' id='1'><p>--  ali<br></td>"
    );
    expect(result._result).not.toContain(
      "<td style='color:blue-odd' id='1'><p>--  ali<br></td>"
    );
  });
  test("check face order condition 1 (order of faces or order of data entry)", async () => {
    // this part i was mistaken ; by miss jafarzade description i found how the second face appears
    il.faces.push(
      {
        name: "face1",
        // replace: true,
        function: true,
        // "row-type": "even",
        filter: "id=3",
        template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
      },
      {
        name: "face2",
        // replace: true,
        function: true,
        // "row-type": "odd",
        filter: "id=1",
        template: "<td style='color:blue-odd' id='@id'><p>--  @name<br></td>",
      }
    );
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(
      checkOrder(
        result._result,
        "<td style='color:blue-odd' id='1'><p>--  ali<br></td>",
        "<td style='color:blue' id='3'><p>--  abolfazl<br></td>"
      )
    ).toBe(true);
  });
  test("check for specefic data and condition data should be show in first face", async () => {
    il.faces.push(
      {
        name: "face1",
        // replace: true,
        function: true,
        // "row-type": "even",
        filter: "id=1",
        template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
      },
      {
        name: "face2",
        // replace: true,
        function: true,
        // "row-type": "odd",
        filter: "id=1",
        template: "<td style='color:blue-odd' id='@id'><p>--  @name<br></td>",
      }
    );
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(
      result._result.includes(
        "<td style='color:blue' id='1'><p>--  ali<br></td>"
      )
    );
    expect(result._result).not.toContain("color:blue-odd");
  });
  test("check one data cant be shown by multi faces", async () => {
    il.faces.push(
      {
        name: "face1",
        // replace: true,
        function: true,
        // "row-type": "even",
        //filter: "id=1",
        template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
      },
      {
        name: "face2",
        // replace: true,
        function: true,
        // "row-type": "odd",
        filter: "id=1",
        template: "<td style='color:blue-odd' id='@id'><p>--  @name<br></td>",
      }
    );
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).not.toContain("color:blue-odd");
  });
  test("check one data is having two face condition the first one renders only", async () => {
    il.faces.push(
      {
        name: "face2",
        // replace: true,
        function: true,
        // "row-type": "odd",
        filter: "id=1",
        template: "<td style='color:blue-odd' id='@id'><p>--  @name<br></td>",
      },
      {
        name: "face1",
        // replace: true,
        function: true,
        // "row-type": "even",
        //filter: "id=1",
        template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
      }
    );
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toContain("color:blue-odd");
  });
  test("check replaces on multi faces", async () => {
    il.faces.push(
      {
        name: "face1",
        replace: true,
        function: true,
        //"row-type": "odd",
        filter: "id<=2",
        template:
          "<td style='color:blue-odd' id='@id'>[(i)5]<p>--  @name<br></td>",
      },
      {
        name: "face1",
        replace: true,
        function: true,
        //"row-type": "even",
        filter: "id>2",
        template:
          "<td style='color:green' id='@id'>[(i)121]<p>--  @name<br></td>",
      }
    );
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(
      result._result.match(/<span style='color:red'>121<\/span>/g).length
    ).toBe(4); 
    expect(
      result._result.match(/<span style='color:red'>5<\/span>/g).length
    ).toBe(2);
  });
  test("expect message if the print have no faces", async () => {
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toBe("محصولی موجود نیست");
  });
  test("filter by other fields in filter", async () => {
    il.faces = [
      {
        name: "face1",
        // replace: true,
        function: true,
        //"row-type": "even",
        filter: "lastname='bazregar'",
        template:
          "<td style='color:green' id='@id'><p>--  @name @lastname<br></td>",
      },
    ];
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toContain(
      "<td style='color:green' id='1'><p>--  ali bazregar<br></td>"
    );
  });
  test("show one null field", async () => {
    //this value may not be acceptable
    il.faces = [
      {
        name: "face1",
        // replace: true,
        function: true,
        //"row-type": "even",
        filter: "id=6",
        template:
          "<td style='color:green' id='@id'><p>--  @name @lastname<br></td>",
      },
    ];
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toContain(
      "<td style='color:green' id='6'><p>--  naser {2}<br></td>"
    );
  });
});
