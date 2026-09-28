import {
  createSocketResponseDataSet,
  parseSocketResponseDataSet,
  shouldPreserveRawSocketResponse,
} from "../../../Models/Connection/SocketConnectionInfo.js";

describe("socket response datasets", () => {
  test("keeps a Python no-data envelope in the result column", () => {
    const raw = "{'msg': 'no data'}";
    const dataSet = createSocketResponseDataSet(raw);

    expect(dataSet.items).toHaveLength(1);
    expect(dataSet.items[0].data).toEqual([{ result: raw }]);
  });

  test("continues to parse actual tabular responses", () => {
    const dataSet = parseSocketResponseDataSet("[{'id': 1, 'name': 'hotel'}]");

    expect(dataSet.items[0].data).toEqual([{ id: 1, name: "hotel" }]);
  });

  test("keeps a command list response as one raw result", () => {
    const raw = "[{'id': 1}, {'id': 2}]";
    const dataSet = createSocketResponseDataSet(raw, { preserveRaw: true });

    expect(dataSet.items).toHaveLength(1);
    expect(dataSet.items[0].data).toEqual([{ result: raw }]);
  });

  test("parses structured command responses when the member has no postsql", () => {
    const command =
      "<basis core='dbsource'><member name='passenger-form' query='{}'></member></basis>";
    const raw = "[{'room': [{'title': 'adult 1'}]}]";
    const preserveRaw = shouldPreserveRawSocketResponse(command);
    const dataSet = createSocketResponseDataSet(raw, { preserveRaw });

    expect(preserveRaw).toBe(false);
    expect(dataSet.items[0].data).toEqual([
      { room: [{ title: "adult 1" }] },
    ]);
  });

  test("keeps command responses raw when member postsql consumes result", () => {
    const command =
      "<basis core='dbsource'><member name='hotel' postsql='select result from [db.hotel]'></member></basis>";

    expect(shouldPreserveRawSocketResponse(command)).toBe(true);
  });
});
