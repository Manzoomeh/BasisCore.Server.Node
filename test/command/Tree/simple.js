import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import TreeCommand from "../../../renderEngine/Command/TreeCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

const settings = new ServiceSettings({});
const context = new RequestContext(settings);
context.cancellation = new CancellationToken();

context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
context.addSource(new JsonSource([{ comment2: "ali" }], "db.tbl2"));

const inlineSourceIl = {
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
};

const treeIl = {
  $type: "tree",
  core: "tree",
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
};

const view = new TreeCommand(treeIl);
const inlineSource = new InlineSourceCommand(inlineSourceIl);
try {
  const result = await Promise.all([
    view.executeAsync(context),
    inlineSource.executeAsync(context),
  ]);

  console.log(result);
} catch (ex) {
  console.error(ex);
}
