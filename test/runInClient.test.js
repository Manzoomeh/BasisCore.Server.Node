import ServiceSettings from "../Models/ServiceSettings.js";
import CancellationToken from "../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../renderEngine/Context/testContext.js";

let groupIl = {
  $type: "group",
  core: "group",
  name: "ROOT_GROUP",
  Commands: [],
};
describe("the group command", () => {
  beforeAll(() => {
    groupIl = {
      $type: "group",
      core: "group",
      name: "ROOT_GROUP",
      Commands: [],
    };
  });
  test("Run at client - Print command", async () => {
    const setting = new ServiceSettings({});
    const context = new TestContext(setting);
    context.cancellation = new CancellationToken();
    groupIl.Commands.push({
      $type: "Print",
      run: "atClient",
      "data-member-name": "clients.names",
      "layout-content":
        "<table width='500' border='1' id='@id'><tbody><tr> @child</tr></tbody></table>",
      "else-layout-content": "محصولی موجود نیست",
      "divider-content": "</tr><tr> ",
      "divider-rowcount": 2,
      "incomplete-content": "<td style='color:red'>red</td>",
      faces: [
        {
          name: "face1",
          replace: true,
          content: "<td style='color:blue' id='@id'><p>--  @name<br></td>",
        },
      ],
      replaces: [
        {
          tagname: "i",
          content: "<span style='color:red'>@val1</span>",
        },
      ],
    });
    const group = new GroupCommand(groupIl);
    const result = await group.executeAsync(context);
    expect(result._results[0]).toEqual();
  });
  test("Run at client - DbSource command", async () => {
    var setting = new ServiceSettings({});
    const context = new TestContext(setting);
    context.cancellation = new CancellationToken();
    groupIl.Commands.push({
      $type: "dbsource",
      core: "dbsource",
      name: "db",
      source: "Source1",
      run: "atClient",
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
          ],
        },
        comment2: {
          Params: [
            {
              Source: "cms",
              Member: "query",
              Column: "id",
            },
            {
              Value: "value",
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
                {
                  Value: "none2",
                },
              ],
            },
            "app",
          ],
        },
      ],
    });
    const group = new GroupCommand(groupIl);
    const result = await group.executeAsync(context);
    expect(result._results).toEqual();
  });
  test("Run at client - InlineSource command", async () => {
    var setting = new ServiceSettings({});
    const context = new TestContext(setting);
    context.cancellation = new CancellationToken();
    groupIl.Commands.push(
      {
        $type: "inlinesource",
        core: "inlinesource",
        name: "db",
        run: "atClient",
        Members: [
          {
            name: "menu",
            preview: "true",
            content: `<row name="Home" id="01" parentid="00" />
      <row name="Irantour" id="02" parentid="00" />
      <row name="HotelReservation" id="03" parentid="00" />
      <row name="Gallery" id="04" parentid="00" />
      <row name="AboutUs" id ="05" parentid="00" />
      <row name="culturalTours" id="06" parentid="02" />
      <row name ="ClimbingTour" id ="07" parentid="02" />
      <row name="PilgrimageTour" id="08" parentid="02" />
      <row name="Esfahan" id="09" parentid="06" />
      <row name="Shiraz" id="10" parentid="06" />
      <row name="Kashan" id="11" parentid="09" />
      <row name="NajafAbad" id="12" parentid="09" />
      <row name="ShahinShar" id="13" parentid="09" />
      <row name="Marvdasht" id="14" parentid="10" />
      <row name="Kazeroon" id="15" parentid="10" />
      <row name="Tehran" id="16" parentid="07" />
      <row name="Lavasanat" id="17" parentid="16" />
      <row name="Damavand" id="18" parentid="16" />
      <row name="GholleDamavand" id="19" parentid="18" />
      <row name="Khorasan" id="20" parentid="08" />
      <row name="Ghom" id="21" parentid="08" />
      <row name="KhorasanRasavi" id="22" parentid="20" />
      <row name="KhorasanShomali" id="23" parentid="20" />
      <row name="KhorasanJonoobi" id="24" parentid="20" />
      <row name="Mashahad" id="25" parentid="22" />
      <row name="Neyshbur" id="26" parentid="22" />
      <row name="Hotels" id="27" parentid="03" />
      <row name="ReservationForm" id="28" parentid="3" />
      <row name="Iran" id="29" parentid="04" />
      <row name="OurTours" id="30" parentid="04" />
      <row name="VideoClips" id="31" parentid="04" />
      <row name="ContactUs" id="32" parentid="05" />`,
          },
        ],
      },
      {
        $type: "tree",
        core: "tree",
        run: "atClient",
        "data-member-name": "db.menu",
        "null-value": "00",
        idcol: "id",
        parentidcol: "parentid",
        "layout-content": '<ul class="menu">@child</ul>',

        faces: [
          {
            level: "end",
            content: "<li><a>@name</a></li>",
          },
          {
            content: `<li><a>@name</a><ul>@child</ul></li>`,
          },
        ],
      }
    );
    const group = new GroupCommand(groupIl);
    const result = await group.executeAsync(context);
    expect(result).toEqual([]);
  });
  test("Run at client - command collection 1", async () => {
    const setting = new ServiceSettings({});
    const context = new TestContext(setting);
    context.cancellation = new CancellationToken();
    groupIl.Commands.push(
      {
        $type: "inlinesource",
        core: "inlinesource",
        name: "db",
        Members: [
          {
            name: "menu",
            preview: "true",
            content: `<row name="Home" id="01" parentid="00" />
      <row name="Irantour" id="02" parentid="00" />
      <row name="HotelReservation" id="03" parentid="00" />
      <row name="Gallery" id="04" parentid="00" />
      <row name="AboutUs" id ="05" parentid="00" />
      <row name="culturalTours" id="06" parentid="02" />
      <row name ="ClimbingTour" id ="07" parentid="02" />
      <row name="PilgrimageTour" id="08" parentid="02" />
      <row name="Esfahan" id="09" parentid="06" />
      <row name="Shiraz" id="10" parentid="06" />
      <row name="Kashan" id="11" parentid="09" />
      <row name="NajafAbad" id="12" parentid="09" />
      <row name="ShahinShar" id="13" parentid="09" />
      <row name="Marvdasht" id="14" parentid="10" />
      <row name="Kazeroon" id="15" parentid="10" />
      <row name="Tehran" id="16" parentid="07" />
      <row name="Lavasanat" id="17" parentid="16" />
      <row name="Damavand" id="18" parentid="16" />
      <row name="GholleDamavand" id="19" parentid="18" />
      <row name="Khorasan" id="20" parentid="08" />
      <row name="Ghom" id="21" parentid="08" />
      <row name="KhorasanRasavi" id="22" parentid="20" />
      <row name="KhorasanShomali" id="23" parentid="20" />
      <row name="KhorasanJonoobi" id="24" parentid="20" />
      <row name="Mashahad" id="25" parentid="22" />
      <row name="Neyshbur" id="26" parentid="22" />
      <row name="Hotels" id="27" parentid="03" />
      <row name="ReservationForm" id="28" parentid="3" />
      <row name="Iran" id="29" parentid="04" />
      <row name="OurTours" id="30" parentid="04" />
      <row name="VideoClips" id="31" parentid="04" />
      <row name="ContactUs" id="32" parentid="05" />`,
          },
        ],
      },
      {
        $type: "tree",
        core: "tree",
        run: "atClient",
        "data-member-name": "db.menu",
        "null-value": "00",
        idcol: "id",
        parentidcol: "parentid",
        "layout-content": '<ul class="menu">@child</ul>',

        faces: [
          {
            level: "end",
            content: "<li><a>@name</a></li>",
          },
          {
            content: `<li><a>@name</a><ul>@child</ul></li>`,
          },
        ],
      }
    );
    const group = new GroupCommand(groupIl);
    const result = await group.executeAsync(context);
    expect(result._results).toEqual([]);
  });
  test("Run at client - command collection case 2", async () => {
    const setting = new ServiceSettings({});
    const context = new TestContext(setting);
    context.cancellation = new CancellationToken();
    groupIl.Commands(
      {
        $type: "dbsource",
        core: "dbsource",
        name: "test",
        run: "atClient",
        source: "findProducts",
        "extra-attribute": {
          parentid: "0",
        },
        Members: [
          {
            name: "test",
            "extra-attribute": {
              type: "list",
              run: "atClient",
            },
          },
        ],
      },
      {
        $type: "print",
        core: "print",
        "data-member-name": "test.test",
        "divider-content": "</tr><tr> ",
        "divider-rowcount": 1,
        faces: [
          {
            name: "face1",
            replace: true,
            content: "@productName:@price",
          },
        ],
      }
    );
    const group = new GroupCommand(groupIl);
    const result = await group.executeAsync(context);
    expect(result._results).toEqual([]);
  });
  test("Run at client - Group command", async () => {
    const setting = new ServiceSettings({});
    const context = new TestContext(setting);
    context.cancellation = new CancellationToken();
    groupIl.Commands.push({
      $type: "call",
      core: "call",
      FileName: "deep.inc",
    });
    groupIl.run = "atClient";
    const group = new GroupCommand(groupIl);
    const result = await group.executeAsync(context);
    console.log(result);
    expect(result._results).toEqual();
  });
});
