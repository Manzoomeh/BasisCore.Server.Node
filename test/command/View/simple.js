import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import InlineSourceCommand from "../../../renderEngine/Command/Source/InlineSourceCommand.js";
import ViewCommand from "../../../renderEngine/Command/ViewCommand.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";

var setting = new ServiceSettings({});
const context = new RequestContext(setting);
context.cancellation = new CancellationToken();

context.addSource(new JsonSource([{ data: "ali" }], "tesT1"));
context.addSource(new JsonSource([{ comment2: "ali" }], "db.tbl2"));

const inlineSourceIl = {
  $type: "inlinesource",
  core: "inlinesource",
  name: "view",
  Members: [
    {
      name: "item",
      preview: "true",
      content: `<row valueID="12688722" mid="20" groupid="249" prpid="8070" usedforid="1255248" typeid="150" multi="0" ord="699" vocabulary="نام_تور_برنامه_ریزی_شده" question="نام تور برنامه ریزی شده" answer="تور استانبول" /> 
        <row valueID="12688725" mid="20" groupid="249" prpid="8074" usedforid="1255248" typeid="140" multi="0" ord="779" vocabulary="روزهای_رفت" question="روزهای رفت" answer="دوشنبه" />
        <row valueID="12688726" mid="20" groupid="249" prpid="8074" usedforid="1255248" typeid="140" multi="0" ord="779" vocabulary="روزهای_رفت" question="" answer="سه شنبه" />
        <row valueID="12688727" mid="20" groupid="249" prpid="8074" usedforid="1255248" typeid="140" multi="0" ord="779" vocabulary="روزهای_رفت" question="" answer="چهارشنبه" />
        <row valueID="12688728" mid="20" groupid="249" prpid="8074" usedforid="1255248" typeid="140" multi="0" ord="779" vocabulary="روزهای_رفت" question="" answer="پنجشنبه" />
        <row valueID="12688729" mid="20" groupid="249" prpid="8074" usedforid="1255248" typeid="140" multi="0" ord="779" vocabulary="روزهای_رفت" question="" answer="جمعه" />
        <row valueID="12688730" mid="20" groupid="249" prpid="8074" usedforid="1255248" typeid="140" multi="0" ord="779" vocabulary="روزهای_رفت" question="" answer="شنبه" />
        <row valueID="12688731" mid="20" groupid="249" prpid="8074" usedforid="1255248" typeid="140" multi="0" ord="779" vocabulary="روزهای_رفت" question="" answer="یکشنبه" />
        <row valueID="12688732" mid="20" groupid="249" prpid="8075" usedforid="1255248" typeid="140" multi="0" ord="799" vocabulary="روزهای_برگشت" question="روزهای برگشت" answer="دوشنبه" /> 
        <row valueID="12688733" mid="20" groupid="249" prpid="8075" usedforid="1255248" typeid="140" multi="0" ord="799" vocabulary="روزهای_برگشت" question="" answer="سه شنبه" />
        <row valueID="12688734" mid="20" groupid="249" prpid="8075" usedforid="1255248" typeid="140" multi="0" ord="799" vocabulary="روزهای_برگشت" question="" answer="چهارشنبه" /> 
        <row valueID="12688735" mid="20" groupid="249" prpid="8075" usedforid="1255248" typeid="140" multi="0" ord="799" vocabulary="روزهای_برگشت" question="" answer="پنجشنبه" /> 
        <row valueID="12688736" mid="20" groupid="249" prpid="8075" usedforid="1255248" typeid="140" multi="0" ord="799" vocabulary="روزهای_برگشت" question="" answer="جمعه" /> 
        <row valueID="12688737" mid="20" groupid="249" prpid="8075" usedforid="1255248" typeid="140" multi="0" ord="799" vocabulary="روزهای_برگشت" question="" answer="شنبه" />
        <row valueID="12688738" mid="20" groupid="249" prpid="8075" usedforid="1255248" typeid="140" multi="0" ord="799" vocabulary="روزهای_برگشت" question="" answer="یکشنبه" /> 
        <row valueID="12688723" mid="20" groupid="249" prpid="8076" usedforid="1255248" typeid="128" multi="0" ord="739" vocabulary="مدت_اقامت" question="مدت اقامت" answer="6 شب و 7 روز" />
        <row valueID="12688724" mid="20" groupid="249" prpid="8077" usedforid="1255248" typeid="128" multi="0" ord="759" vocabulary="تاریخ_اعتبار" question="تاریخ اعتبار" answer="15MAR-28MAR" />
        <row valueID="12688739" mid="20" groupid="249" prpid="8080" usedforid="1255248" typeid="140" multi="0" ord="825" vocabulary="خدمات" question="خدمات" answer="صبحانه" /> 
        <row valueID="12688740" mid="20" groupid="249" prpid="8080" usedforid="1255248" typeid="140" multi="0" ord="825" vocabulary="خدمات" question="" answer="ترانسفر فرودگاهی" />
        <row valueID="12688741" mid="20" groupid="249" prpid="8080" usedforid="1255248" typeid="140" multi="0" ord="825" vocabulary="خدمات" question="" answer="گشت شهری با نهار" /> 
        <row valueID="12688745" mid="20" groupid="249" prpid="8082" usedforid="1255248" typeid="140" multi="0" ord="945" vocabulary="محل_اقامت" question="محل اقامت" answer="هتل" />
        <row valueID="12688746" mid="20" groupid="249" prpid="8083" usedforid="1255248" typeid="140" multi="0" ord="965" vocabulary="حمل_و_نقل" question="حمل و نقل" answer="هواپیما" /> 
        <row valueID="12688742" mid="20" groupid="249" prpid="8087" usedforid="1255248" typeid="140" multi="0" ord="839" vocabulary="نوع_پرواز" question="نوع پرواز" answer="چارتر" /> 
        <row valueID="12688743" mid="20" groupid="249" prpid="8088" usedforid="1255248" typeid="140" multi="0" ord="859" vocabulary="کلاس_پرواز" question="کلاس پرواز" answer="کلاس اقتصادی" />
        <row valueID="12688744" mid="20" groupid="249" prpid="8089" usedforid="1255248" typeid="140" multi="0" ord="879" vocabulary="نوع_بلیط" question="نوع بلیط" answer="بلیط رفت و برگشت" />
        <row valueID="12688750" mid="20" groupid="249" prpid="8097" usedforid="1255248" typeid="144" multi="1" ord="1179" vocabulary="توضیحات_تور" question="توضیحات تور" answer="نرخ نوزاد 200.000 تومان می باشد." />
        <row valueID="12748850" mid="20" groupid="249" prpid="8181" usedforid="1255248" typeid="251" multi="1" ord="1199" vocabulary="شروع_قیمت_ها_از_" question="شروع قیمت ها از" answer="1845000تومان" /> 
        <row valueID="12689451" mid="20" groupid="249" prpid="8185" usedforid="1255248" typeid="160" multi="0" ord="1120" vocabulary="عکس_کوچک_1" question="عکس کوچک 1" answer="" />
        <row valueID="12738024" mid="20" groupid="249" prpid="8186" usedforid="1255248" typeid="161" multi="0" ord="1140" vocabulary="عکس_کوچک_2" question="عکس کوچک 2" answer="" />
        <row valueID="12738025" mid="20" groupid="249" prpid="8187" usedforid="1255248" typeid="162" multi="0" ord="1160" vocabulary="عکس_کوچک_3" question="عکس کوچک 3" answer="" />
        <row valueID="12738026" mid="20" groupid="249" prpid="54281" usedforid="1255248" typeid="159" multi="0" ord="1680" vocabulary="عکس_اورجینال" question="عکس اورجینال" answer="" />
        <row valueID="1878635" mid="20" groupid="986" prpid="10000502" usedforid="1255248" typeid="199" multi="0" ord="0" vocabulary="کشور_مقصد" question="کشور مقصد" answer="ترکیه" /> 
        <row valueID="1878636" mid="20" groupid="1123" prpid="10000503" usedforid="1255248" typeid="199" multi="0" ord="0" vocabulary="شهر_مقصد" question="شهر مقصد" answer="استانبول" />
        <row valueID="1878671" mid="20" groupid="987" prpid="10000504" usedforid="1255248" typeid="199" multi="0" ord="0" vocabulary="خط_هوایی" question="خط هوایی" answer="Atlasglobal Airlines" />`,
    },
  ],
};

const viewIl = {
  $type: "Print",
  "data-member-name": "view.item",
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

const view = new ViewCommand(viewIl);
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
