import alasql from "alasql";
import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";
import TestContext from "../../../renderEngine/Context/TestContext.js";
import VoidContext from "../../../renderEngine/Context/VoidContext.js";
import CommandUtil from "../../../renderEngine/CommandUtil.js";
var setting = new ServiceSettings({});
const context = new TestContext(setting,"1",CommandUtil.addDefaultCommands());
context.debugContext = new VoidContext("test")
context.cancellation = new CancellationToken();

const il = {
  $type: "group",
  core: "group",
  Commands: [
    {
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
      $type: "inlinesource",
      core: "inlinesource",
      name: "join",
      Members: [
        {
          type: "sql",
          content:
            "SELECT *  FROM [view.item] WHERE valueID = '12688740' and groupid='249'",
          name: "sss",
        },
      ],
    },
    {
      $type: "Print",
      "data-member-name": "join.sss",
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
          function: true,
          filter: "valueId = '12688740'",
          content:
            "<td style='color:green' id='usedforid'><p> @valueID @mid @groupId @prpid @usedforId @typeId @multi @ord<br></td>",
        },
      ],
      replaces: [
        {
          tagname: "i",
          content: "<span style='color:red'>@val1</span>",
        },
      ],
    },
  ],
};
const group = new GroupCommand(il);
const groupResult = await group.executeAsync(context);
console.log(groupResult);