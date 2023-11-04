import PrintCommand from "../renderEngine/Command/PrintCommand.js";
import ContextBase from "../renderEngine/Context/ContextBase.js";
import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import JsonSource from "../renderEngine/Source/JsonSource.js";
const il = {
  $timportpe: "Print",
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
describe("print command part2", () => {
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
            { id: 6, name: "naser", lastname: "zeinali" },
          ],
          "clients.names"
        )
      );
    });
  });
  afterEach(() => {
    il.faces = [];
    il["divider-rowcount"] = 2;
    il["data-member-name"] = "clients.names";
    il["else-layout-content"] = "محصولی موجود نیست";
  });
  test("should be started with layout-content", async () => {
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
    expect(result._result).toMatch(
      /^<table width='500' border='1' id='@id'><tbody><tr>/
    );
  });
  test.each([1, 2, 3, 6])(
    "divider changes by divider-rowcount value of %i",
    async (i) => {
      il.faces.push({
        name: "face1",
        replace: true,
        function: true,
        template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
      });
      il["divider-rowcount"] = i;
      const print = new PrintCommand(il);
      const result = await print.executeAsync(context);
      const splitedResult = result._result.split("</tr><tr>");
      expect(
        splitedResult.length == 6 / i || splitedResult.length == 6 / i - 1
      ).toBe(true);
    }
  );
  test("the html should be ended with what we have after the @value", async () => {
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    expect(result._result).toMatch(/<\/tr><\/tbody><\/table>$/);
  });
  // test("check the il for incorrect datamembername", async () => {
  //   setTimeout(() => {
  //     // do something
  //   }, 10000);
  //   il["data-member-name"] = "s1.s2";
  //   il.faces.push({
  //     name: "face1",
  //     replace: true,
  //     function: true,
  //     template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
  //   });
  //   const print = new PrintCommand(il);
  //   const result = await print.executeAsync(context);
  //   expect(print.executeAsync).not.toHaveReturned();
  // });
  test("value is correct when else layout is null", async () => {
    delete il["else-layout-content"];
    il.faces.push({
      name: "face1",
      replace: true,
      function: true,
      template: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
      filter: "id>1000",
    });
    const print = new PrintCommand(il);
    const result = await print.executeAsync(context);
    //ask about this
    expect(result._result).toBe(null);
  });
});
