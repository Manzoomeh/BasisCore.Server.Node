import { jest } from "@jest/globals";
import TrackingCommand from "../../../renderEngine/Command/TrackingCommand.js";
import CookieCommand from "../../../renderEngine/Command/CookieCommand.js";
import GroupCommand from "../../../renderEngine/Command/Collection/GroupCommand.js";
import LocalContext from "../../../renderEngine/Context/LocalContext.js";
import SourceRepository from "../../../renderEngine/Context/SourceRepository.js";

function trackingIl(overrides = {}) {
  return {
    $type: "tracking",
    core: "tracking",
    name: "tracking",
    source: "Monitoring",
    collectionname: "activity",
    dbname: "tracking",
    addcookie: "true",
    ...overrides,
  };
}

function createRootContext(insertOne) {
  const repository = new SourceRepository(null);
  const context = {
    repository,
    domainId: 12,
    debugContext: {},
    cancellation: null,
    __executedTrackingCommands: new Map(),
    createTrackingDocument() {
      return {
        DomainId: "12",
        request: { url: "/products/1" },
      };
    },
    insertMongoDocumentAsync: insertOne,
    addSource(dataSource) {
      repository.addSource(dataSource);
    },
    addGlobalSource(dataSource) {
      repository.addSource(dataSource);
    },
    tryGetSource(sourceId) {
      return repository.tryToGet(sourceId);
    },
  };

  return context;
}

describe("TrackingCommand", () => {
  test("publishes inserted.id before a dependent cookie is evaluated", async () => {
    let releaseInsert;
    const insertOne = jest.fn(
      () =>
        new Promise((resolve) => {
          releaseInsert = () => resolve({
            toHexString: () => "6a5b473b804688695a4beeed",
          });
        })
    );
    const context = createRootContext(insertOne);
    const addCookie = jest.fn();
    context.addCookie = addCookie;
    context.cancellation = {
      throwIfCancellationRequested() {},
    };
    context.debugContext = {
      newStep() {
        return {
          complete() {},
          failed() {},
        };
      },
    };
    context.createCommand = (il) => {
      if (il.$type === "tracking") {
        return new TrackingCommand(il);
      }
      if (il.$type === "cookie") {
        return new CookieCommand(il);
      }
      throw new Error(`Unexpected command type '${il.$type}'`);
    };

    const collection = new GroupCommand({
      $type: "group",
      core: "group",
      Commands: [
        trackingIl(),
        {
          $type: "cookie",
          core: "cookie",
          name: "trackingid",
          value: {
            Params: [
              {
                Source: "tracking",
                Member: "inserted",
                Column: "id",
              },
              { Value: "0" },
            ],
          },
        },
      ],
    });

    const execution = collection.executeCommandBlocks(context);
    await new Promise((resolve) => setImmediate(resolve));
    expect(addCookie).not.toHaveBeenCalled();

    releaseInsert();
    await execution;

    expect(addCookie).toHaveBeenCalledWith(
      "trackingid",
      "6a5b473b804688695a4beeed",
      null,
      null
    );
  });

  test("inserts the request document and exposes inserted.id", async () => {
    const insertOne = jest.fn().mockResolvedValue({
      toHexString: () => "507f1f77bcf86cd799439011",
    });
    const context = createRootContext(insertOne);

    await new TrackingCommand(trackingIl())._executeCommandAsync(context);

    expect(insertOne).toHaveBeenCalledWith(
      "tracking",
      "tracking",
      "activity",
      {
        DomainId: "12",
        request: { url: "/products/1" },
      }
    );
    expect(context.tryGetSource("tracking.inserted").data).toEqual([
      { id: "507f1f77bcf86cd799439011" },
    ]);
  });

  test("runs once and publishes the source to sibling local contexts", async () => {
    let releaseInsert;
    const insertOne = jest.fn(
      () =>
        new Promise((resolve) => {
          releaseInsert = () => resolve("inserted-id");
        })
    );
    const root = createRootContext(insertOne);
    const firstContext = new LocalContext(root);
    const secondContext = new LocalContext(root);
    const nestedContext = firstContext.createContext("nested");

    const firstExecution = new TrackingCommand(
      trackingIl()
    )._executeCommandAsync(nestedContext);
    const secondExecution = new TrackingCommand(
      trackingIl()
    )._executeCommandAsync(secondContext);

    await new Promise((resolve) => setImmediate(resolve));
    expect(insertOne).toHaveBeenCalledTimes(1);

    releaseInsert();
    await Promise.all([firstExecution, secondExecution]);

    expect(root.tryGetSource("tracking.inserted").data).toEqual([
      { id: "inserted-id" },
    ]);
    expect(firstContext.tryGetSource("tracking.inserted")).not.toBeNull();
    expect(secondContext.tryGetSource("tracking.inserted")).not.toBeNull();
    expect(nestedContext.__executedTrackingCommands).toBe(
      root.__executedTrackingCommands
    );
  });

  test("removes a failed execution so it can be retried", async () => {
    const insertOne = jest
      .fn()
      .mockRejectedValueOnce(new Error("temporary Mongo error"))
      .mockResolvedValueOnce("retry-id");
    const context = createRootContext(insertOne);
    const command = new TrackingCommand(trackingIl());

    await expect(command._executeCommandAsync(context)).rejects.toThrow(
      "temporary Mongo error"
    );
    await command._executeCommandAsync(context);

    expect(insertOne).toHaveBeenCalledTimes(2);
    expect(context.tryGetSource("tracking.inserted").data).toEqual([
      { id: "retry-id" },
    ]);
  });

  test.each([
    ["name", { name: null }, "name"],
    ["collectionname", { collectionname: null }, "collectionname"],
  ])(
    "rejects a missing %s attribute",
    async (_attribute, overrides, expectedMessage) => {
      const context = createRootContext(jest.fn());
      const command = new TrackingCommand(trackingIl(overrides));

      await expect(command._executeCommandAsync(context)).rejects.toThrow(
        expectedMessage
      );
    }
  );
});
