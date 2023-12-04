// import { beforeAll } from "@jest/globals";
import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";
import DbSource from "../../../renderEngine/Command/Source/DbSource.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import ExceptionResult from "../../../renderEngine/Models/ExceptionResult.js";
import VoidResult from "../../../renderEngine/Models/VoidResult.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";
import sql from "mssql";
expect.extend({
  toEqualIgnoringProductId(received, expected) {
    const sanitizedReceived = received.map(({ productId, ...rest }) => rest);
    const sanitizedExpected = expected.map(({ productId, ...rest }) => rest);

    const pass = this.equals(sanitizedReceived, sanitizedExpected);

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} not to equal ${this.utils.printExpected(
            expected
          )} (ignoring productId)`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} to equal ${this.utils.printExpected(
            expected
          )} (ignoring productId)`,
        pass: false,
      };
    }
  },
});

const hostOptions = {
  Type: "sql",
  ReadBodyTimeOut: 6000000,
  ProcessTimeout: 1000000,
  IsActive: true,
  MaxBodySize: 102400000,
  MaxMultiPartSize: 1024000000,
  Settings: {
    //this is right now not implemented
    LibPath: "D:\\Programming\\Falsafi\\WebServer\\commands",
    CallMaxDepth: 1,
    "Connections.sql.GetProductsByCategory": {
      connectionString:
        "Server=172.20.20.200;Database=test;User Id=sa;Password=Salam1Salam2;trustServerCertificate=true",
      procedure: "[dbo].[GetProductsByCategory]",
      requestTimeout: 2000,
      testTimeOut: 1000,
    },
  },
};
var setting = new ServiceSettings(hostOptions);
let il = {
  $type: "dbsource",
  core: "dbsource",
  name: "test",
  source: "getproductsbycategory",
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
};
let pool;

describe("dbsource", () => {
  beforeAll(async () => {
    pool = new sql.ConnectionPool({
      user: "sa",
      password: "Salam1Salam2",
      server: "172.20.20.200",
      database: "test",
      options: {
        trustServerCertificate: true,
      },
    });

    await pool.connect();

    // Begin a transaction for setup
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      await Promise.all([
        pool.request().query(`
IF NOT EXISTS (SELECT * FROM sys.types WHERE name = 'name_value' AND is_table_type = 1)
BEGIN
    CREATE TYPE [dbo].[name_value] AS TABLE (
        [name] [nvarchar](4000) NULL,
        [value] [nvarchar](max) NULL
    );
END;
            `),
        pool.request().query(`
                INSERT INTO Products (ProductName, Price, Description, Manufacturer, Category) VALUES
('Product J', 15.99, 'Product J Description', 'Manufacturer X', 'Category 1'),
   ('Product K', 12.49, 'Product K Description', 'Manufacturer Y', 'Category 2'),
   ('Product L', 7.79, 'Product L Description', 'Manufacturer Z', 'Category 3'),
   ('Product M', 20.99, 'Product M Description', 'Manufacturer X', 'Category 1'),
   ('Product N', 9.99, 'Product N Description', 'Manufacturer Y', 'Category 2'),
   ('Product O', 18.49, 'Product O Description', 'Manufacturer Z', 'Category 3'),
   ('Product P', 13.99, 'Product P Description', 'Manufacturer X', 'Category 1'),
   ('Product Q', 22.49, 'Product Q Description', 'Manufacturer Y', 'Category 2'),
   ('Product R', 11.79, 'Product R Description', 'Manufacturer Z', 'Category 3'),
   ('Product S', 30.99, 'Product S Description', 'Manufacturer X', 'Category 1');
            `),
        pool.request().query(`
                CREATE OR ALTER PROCEDURE [dbo].[GetProductsByCategory]
                    @command xml,
                    @dmnid int,
                    @params [dbo].[name_value] READONLY
                AS
                BEGIN
                    SELECT *
                    FROM Products;
                END;
            `),
      ]);

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // Rollback the transaction if an error occurs
      await transaction.rollback();
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Begin a transaction for cleanup
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      await Promise.all([
        pool.request().query(`DELETE FROM Products`),
        pool.request().query("DROP PROCEDURE [dbo].[GetProductsByCategory]"),
      ]);

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      console.error("Error cleaning up database:", error.message);
    } finally {
      // Close the pool
      await pool.close();
      il = {
        $type: "dbsource",
        core: "dbsource",
        name: "test",
        source: "getproductsbycategory",
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
      };
    }
  });

  test("run dbsource without errors", async () => {
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    const source = new DbSource(il);
    expect(async () => await source.executeAsync(context)).not.toThrow();
  });

  test("run dbsource without errors and return empty Object", async () => {
    const source = new DbSource(il);
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    const result = await source.executeAsync(context);
    expect(result).toEqual({});
  });
  test("the empty object that db source returns is an instance of voidResult", async () => {
    const source = new DbSource(il);
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    const result = await source.executeAsync(context);
    expect(
      result
       instanceof VoidResult
    ).toBe(true);
  });

  test("the il should be case-insensetive", async () => {
    const context = new RequestContext(setting);
    il.source = "GetProductsByCategory";
    const source = new DbSource(il);
    context.cancellation = new CancellationToken();
    const result = await source.executeAsync(context);
    expect(result).toEqual({});
    expect(result instanceof VoidResult).toBe(true);
  });
  test("when il source is wrong il should show error in result;", async () => {
    il.source = "xxxxxxxxx";
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    const source = new DbSource(il);
    const result = await source.executeAsync(context);
    expect(result).not.toBe({});
  });
  test("when il source is wrong il should show error in result;", async () => {
    il.source = "xxxxxxxxx";
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    const source = new DbSource(il);
    const result = await source.executeAsync(context);
    expect(result instanceof ExceptionResult).toBe(true);
  });
  test("when il source is correct the result length should be correct", async () => {
    const source = new DbSource(il);
    context.cancellation = new CancellationToken();
    const context = new RequestContext(setting);
    const result = await source.executeAsync(context);
    expect(context.tryGetSource("test.test").data.length).toBe(10);
  });
  test("when il source is wrong il should show ", async () => {
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    il.source = "xxxxxxxxx";
    console.log(il);
    const source = new DbSource(il);
    await source.executeAsync(context);
    expect(context.tryGetSource("test.test")).toEqual(null);
  });

  const productsData = [
    {
      ProductName: "Product J",
      Price: 15.99,
      Description: "Product J Description",
      Manufacturer: "Manufacturer X",
      Category: "Category 1",
    },
    {
      ProductName: "Product K",
      Price: 12.49,
      Description: "Product K Description",
      Manufacturer: "Manufacturer Y",
      Category: "Category 2",
    },
    {
      ProductName: "Product L",
      Price: 7.79,
      Description: "Product L Description",
      Manufacturer: "Manufacturer Z",
      Category: "Category 3",
    },
    {
      ProductName: "Product M",
      Price: 20.99,
      Description: "Product M Description",
      Manufacturer: "Manufacturer X",
      Category: "Category 1",
    },
    {
      ProductName: "Product N",
      Price: 9.99,
      Description: "Product N Description",
      Manufacturer: "Manufacturer Y",
      Category: "Category 2",
    },
    {
      ProductName: "Product O",
      Price: 18.49,
      Description: "Product O Description",
      Manufacturer: "Manufacturer Z",
      Category: "Category 3",
    },
    {
      ProductName: "Product P",
      Price: 13.99,
      Description: "Product P Description",
      Manufacturer: "Manufacturer X",
      Category: "Category 1",
    },
    {
      ProductName: "Product Q",
      Price: 22.49,
      Description: "Product Q Description",
      Manufacturer: "Manufacturer Y",
      Category: "Category 2",
    },
    {
      ProductName: "Product R",
      Price: 11.79,
      Description: "Product R Description",
      Manufacturer: "Manufacturer Z",
      Category: "Category 3",
    },
    {
      ProductName: "Product S",
      Price: 30.99,
      Description: "Product S Description",
      Manufacturer: "Manufacturer X",
      Category: "Category 1",
    },
  ];

  for (let index in productsData) {
    test("expect to have element number" + index + " in array", async () => {
      const context = new RequestContext(setting);
      context.cancellation = new CancellationToken();
      const source = new DbSource(il);
      await source.executeAsync(context);
     // const { ProductID, RowNumber, ...resultWithoutId } =
       const res =  context.waitToGetSourceAsync("test.test")//.data[index];
      expect(res).toEqual(productsData[index]);
    });
  }

  test("when il source is wrong il should show and run with promise.all ", async () => {
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    il.source = "xxxxxxxxx";
    console.log(il);
    const source = new DbSource(il);
    const [result, contextResult] = await Promise.all([
      source.executeAsync(context),
      context.waitToGetSourceAsync("test.test"),
    ]);
    expect(contextResult).toEqual({});
  });

  for (let index in productsData) {
    test("expect to have element number" + index + " in array", async () => {
      const context = new RequestContext(setting);
      const source = new DbSource(il);
      const [result, contextResult] = await Promise.all([
        await source.executeAsync(context),
        context.waitToGetSourceAsync("test.test"),
      ]);
      const { ProductID, RowNumber, ...resultWithoutId } =
        contextResult.data[index];
      expect(resultWithoutId).toEqual(productsData[index]);
    });
  }
  test("when il member is empty dont show the data", async () => {
    const context = new RequestContext(setting);
    context.cancellation = new CancellationToken();
    il.Members = [];
    const source = new DbSource(il);
    const [result, contextResult] = await Promise.all([
      source.executeAsync(context),
      context.waitToGetSourceAsync("test.test"),
    ]);
    expect(contextResult).toBe(1);
  });
});
