import {
  enrichLegacyFormFields,
  getLegacyJsonHeader,
  parseBodyFormFields,
  shouldCollectRequestBody,
} from "../../modules/requestBody.js";

describe("request body form mapping", () => {
  test("maps a text/plain JSON object to cms.form fields", () => {
    const form = parseBodyFormFields(
      JSON.stringify({
        cityid: "100103",
        rooms: [{ adultcount: 2, childcountandage: "" }],
        fdate: "2026-07-20",
      }),
      "text/plain;charset=UTF-8"
    );

    expect(form).toEqual({
      cityid: "100103",
      rooms: [{ adultcount: 2, childcountandage: "" }],
      fdate: "2026-07-20",
    });
  });

  test("maps application/json with a charset to cms.form fields", () => {
    expect(
      parseBodyFormFields('{"cityid":42}', "application/json; charset=utf-8")
    ).toEqual({ cityid: 42 });
  });

  test("keeps non-JSON text out of cms.form", () => {
    expect(parseBodyFormFields("plain request body", "text/plain")).toBeNull();
  });

  test("maps a legacy urlencoded fetch body sent as text/plain", () => {
    const form = parseBodyFormFields(
      "nationality=IR&hotelid=&cityid=100103&fdate=2026-07-20&tdate=2026-07-22&rooms=%5B%7B%22adultcount%22%3A2%7D%5D&clid=2&sid=2",
      "text/plain;charset=UTF-8"
    );

    expect(form).toMatchObject({
      nationality: "IR",
      hotelid: "",
      cityid: "100103",
      fdate: "2026-07-20",
      tdate: "2026-07-22",
      rooms: '[{"adultcount":2}]',
      clid: "2",
      sid: "2",
    });
  });

  test("preserves form-urlencoded parsing", () => {
    expect(
      parseBodyFormFields(
        "cityid=100103&fdate=2026-07-20",
        "application/x-www-form-urlencoded"
      )
    ).toMatchObject({ cityid: "100103", fdate: "2026-07-20" });
  });

  test("rejects a JSON array as cms.form", () => {
    expect(parseBodyFormFields('[{"cityid":42}]', "application/json")).toBeNull();
  });

  test("removes prototype-pollution keys recursively", () => {
    const form = parseBodyFormFields(
      '{"cityid":42,"rooms":[{"adultcount":2,"__proto__":{"admin":true}}]}',
      "application/json"
    );

    expect(form.cityid).toBe(42);
    expect(form.rooms[0]).toEqual({ adultcount: 2 });
    expect(Object.hasOwn(form.rooms[0], "__proto__")).toBe(false);
  });

  test.each([
    "text/plain;charset=UTF-8",
    "application/json",
    "application/problem+json",
    "application/x-www-form-urlencoded",
  ])("collects supported request bodies for %s", (contentType) => {
    expect(shouldCollectRequestBody(contentType)).toBe(true);
  });
});

describe("enrichLegacyFormFields", () => {
  test("builds the legacy rooms object while retaining flat form fields", () => {
    const form = parseBodyFormFields(
      "cityid=1177676&_root.rooms__1.adultcount=2&_root.rooms__1.childcountandage=0",
      "application/x-www-form-urlencoded"
    );

    enrichLegacyFormFields(form);

    expect(form.cityid).toBe("1177676");
    expect(form["_root.rooms__1.adultcount"]).toBe("2");
    expect(form._root).toEqual({
      rooms: [{ adultcount: "2", childcountandage: "0" }],
    });
  });

  test("collects multiple rooms in their legacy array order", () => {
    const form = {
      "_root.rooms__1.adultcount": "2",
      "_root.rooms__2.adultcount": "1",
    };

    enrichLegacyFormFields(form);

    expect(form._root).toEqual({
      rooms: [{ adultcount: "2" }, { adultcount: "1" }],
    });
  });

  test("provides rooms without the _root marker for cms.json.header", () => {
    const form = {
      "_root.rooms__1.adultcount": "2",
      "_root.rooms__1.childcountandage": "0",
    };

    expect(JSON.parse(getLegacyJsonHeader(form))).toEqual({
      rooms: [{ adultcount: "2", childcountandage: "0" }],
    });
  });
});
