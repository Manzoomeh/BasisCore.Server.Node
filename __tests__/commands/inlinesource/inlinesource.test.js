import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";
import ContextBase from "../../../renderEngine/Context/ContextBase.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import InlineSource from "../../../renderEngine/Command/Source/InlineSourceCommand.js";

const context = new ContextBase();
context.cancellation = new CancellationToken();
function extractAttributesFromString(inputString) {
  const attributePattern = /(\w+)="([^"]*)"/g;
  const rows = [];
  let match;
  while ((match = attributePattern.exec(inputString)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key === "valueID") {
      const row = {};
      row[key] = value;
      rows.push(row);
    } else {
      if (key == "answer" || key == "vocabulary" || key == "question") {
      } else {
        rows[rows.length - 1][key] = value;
      }
    }
  }
  return rows;
}
const il = {
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
        <row valueID="12748850" mid="20" groupid="249" prpid="8181" usedforid="1255248" typeid="251" multi="1" ord="1199" vocabulary="شروع_قیمت_ها_از_" question="شروع قیمت ها از" answer="1845000تومان" /> `,
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
};
const printIl = {
  $type: "Print",
  "data-member-name": "view.item",
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
      content: "<span style='color:red'>@val1</span>",
    },
  ],
};
const extractedArr = extractAttributesFromString(il.Members[0].content);

describe("testing InlineSource with Command", () => {
  beforeAll(() => { });

  afterEach(() => {
    printIl.faces = [];
    il.Members = [
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
        <row valueID="12748850" mid="20" groupid="249" prpid="8181" usedforid="1255248" typeid="251" multi="1" ord="1199" vocabulary="شروع_قیمت_ها_از_" question="شروع قیمت ها از" answer="1845000تومان" /> `,
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
    ];
  });
  extractedArr.forEach((object) => {
    test("show this  data in inlinesource : " + object, async () => {
      const inlinesource = new InlineSource(il);
      printIl.faces.push({
        name: "face1",
        replace: true,
        function: true,
        content:
          "<td style='color:green' id='usedforid'><p> @valueID @mid @groupid @prpid @usedforid @typeid @multi @ord<br></td>",
      });
      const print = new PrintCommand(printIl);
      const [result,_] = await Promise.all([
        print.executeAsync(context),
        inlinesource.executeAsync(context)
      ])
      for (let key in object) {
        let value = object[key];
        expect(result._result).toContain(value);
      }
    });
  });
  test("expect to context be a object", async () => {
    const inlinesource = new InlineSource(il);
    printIl.faces.push({
      name: "face1",
      replace: true,
      function: true,
      content:
        "<td style='color:green' id='usedforid'><p> valueID:@valueID mid:@mid groupid:@groupid prpid:@prpid usedforid:@usedforid typeid:@typeid multi:@multi ord:@ord<br></td>",
    });
    await inlinesource.executeAsync(context);
    expect(typeof context).toBe("object");
  });
  test(" having first row data in context after inlinesource command", async () => {
    const inlinesource = new InlineSource(il);
    await inlinesource.executeAsync(context);
    expect(context.tryGetSource("view.item").data[0]).toStrictEqual({
      RowNumber: 1,
      answer: "تور استانبول",
      groupid: "249",
      mid: "20",
      multi: "0",
      ord: "699",
      prpid: "8070",
      question: "نام تور برنامه ریزی شده",
      typeid: "150",
      usedforid: "1255248",
      valueID: "12688722",
      vocabulary: "نام_تور_برنامه_ریزی_شده",
    });
  });
  test("preview has no effect on data on context", async () => {
    il.Members[0].preview = false;
    const inlinesource = new InlineSource(il);
    await inlinesource.executeAsync(context);
    expect(context.tryGetSource("view.item").data[0]).toStrictEqual({
      RowNumber: 1,
      answer: "تور استانبول",
      groupid: "249",
      mid: "20",
      multi: "0",
      ord: "699",
      prpid: "8070",
      question: "نام تور برنامه ریزی شده",
      typeid: "150",
      usedforid: "1255248",
      valueID: "12688722",
      vocabulary: "نام_تور_برنامه_ریزی_شده",
    });
  });
  test("the context should have the same length as  row numbers", async () => {
    const inlinesource = new InlineSource(il);
    await inlinesource.executeAsync(context);
    expect(context.tryGetSource("view.item").data.length).toBe(27);
  });
  test("the context should have the same length as  row numbers in member 2", async () => {
    const inlinesource = new InlineSource(il);
    await inlinesource.executeAsync(context);
    expect(context.tryGetSource("view.menu").data.length).toBe(32);
  });
});
// describe("the context for second member most have all properties", () => {
//   beforeAll(async () => {
//     const inlinesource = new InlineSource(il);
//     await inlinesource.executeAsync(context);
//   });
// });
