import { beforeAll } from "@jest/globals";
import ServiceSettings from "../../../models/ServiceSettings.js";
import CancellationToken from "../../../renderEngine/Cancellation/CancellationToken.js";
import PrintCommand from "../../../renderEngine/Command/PrintCommand.js";
import DbSource from "../../../renderEngine/Command/Source/DbSource.js";
import RequestContext from "../../../renderEngine/Context/RequestContext.js";
import JsonSource from "../../../renderEngine/Source/JsonSource.js";
import sql from "mssql"

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
            connectionString: "Server=172.20.20.200;Database=test;User Id=sa;Password=Salam1Salam2;trustServerCertificate=true",
            procedure: "[dbo].[GetProductsByCategory]",
            requestTimeout: 2000,
            testTimeOut: 1000,
        },

        "Connections.sql.GetProductsBelowPrice": {
            connectionString: "Server=172.20.20.200;Database=test;User Id=sa;Password=Salam1Salam2;trustServerCertificate=true",
            procedure: "[dbo].[GetProductsBelowPrice]",
            requestTimeout: 2000,
            testTimeOut: 1000,

        },
    }, 
}
var setting = new ServiceSettings(hostOptions);
const context = new RequestContext(setting);
const il = {
    $type: "dbsource",
    core: "dbsource",
    name: "tdb", 
    source : "test",
    procedureName: "GetProductsBelowPrice",
    "extra-attribute": {
        parentid: "0",
    },
    Members: [
        {
            name: "memberName",
            "extra-attribute": {
                type: "list",
                run: "atClient"
            },
        }
    ],
};
let pool
context.cancellation = new CancellationToken();
describe("db source test", () => {
    beforeAll(async () => {
        // Create a connection pool once for all tests
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
        await pool.request().query(
            `INSERT INTO Products (ProductName, Price, Description, Manufacturer, Category) VALUES
   ('Product J', 15.99, 'Product J Description', 'Manufacturer X', 'Category 1'),
   ('Product K', 12.49, 'Product K Description', 'Manufacturer Y', 'Category 2'),
   ('Product L', 7.79, 'Product L Description', 'Manufacturer Z', 'Category 3'),
   ('Product M', 20.99, 'Product M Description', 'Manufacturer X', 'Category 1'),
   ('Product N', 9.99, 'Product N Description', 'Manufacturer Y', 'Category 2'),
   ('Product O', 18.49, 'Product O Description', 'Manufacturer Z', 'Category 3'),
   ('Product P', 13.99, 'Product P Description', 'Manufacturer X', 'Category 1'),
   ('Product Q', 22.49, 'Product Q Description', 'Manufacturer Y', 'Category 2'),
   ('Product R', 11.79, 'Product R Description', 'Manufacturer Z', 'Category 3'),
   ('Product S', 30.99, 'Product S Description', 'Manufacturer X', 'Category 1');`
        )
        await pool.request().query(
            `CREATE OR ALTER PROCEDURE GetProductsBelowPrice
    @LimitPrice DECIMAL(10, 2)
AS
BEGIN
    SELECT ProductID, ProductName, Price, Description, Manufacturer, Category
    FROM Products
    WHERE Price < @LimitPrice;
END;
`
        )
        await pool.request().query(
            `CREATE OR ALTER PROCEDURE GetProductsByCategory
    @Category NVARCHAR(255)
AS
BEGIN
    SELECT ProductID, ProductName, Price, Description, Manufacturer
    FROM Products
    WHERE Category = @Category;
END;
;`
        )
    });

    afterAll(async () => {
        await pool.request().query(`DELETE FROM Users`)
        await pool.request().query("DROP PROCEDURE dbo.FindUserByUsername")
        await pool.request().query("DROP PROCEDURE dbo.getAllUsers")
        await pool.close();
    });
    test("run dbsource without errors", async () => {
        const source = new DbSource(il);

        expect(async () => await source.executeAsync(context)).not.toThrow();
    })
    test("run dbsource without errors", async () => {
        const source = new DbSource(il);
        const result = await source.executeAsync(context)
        console.log(result)
        console.log(source)
        expect(result).toBe();
    })
})