import ConnectionUtil from "./../../Models/Connection/ConnectionUtil"
import InvalidConfigException from "../../Models/Exceptions/InvalidConfigException"
import SqlConnectionInfo from "../../Models/Connection/SqlConnectionInfo"
import { jest } from '@jest/globals'
// const setting = {
//     "Connections.sql.RoutingData": {
//         connectionString:
//             "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
//         procedure: "[dbo].[DBSourceProcedure]",
//         requestTimeout: 2000,
//         testTimeOut: 1000,
//     },
//     "Connections.sql.CallCommand": {
//         connectionString:
//             "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
//         procedure: "[dbo].[DBSourceProcedure]",
//     },
//     "Connections.sql.ILUpdate": {
//         connectionString:
//             "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
//         procedure: "[dbo].[DBSourceProcedure]",
//     },
//     "Connections.sql.source1": {
//         connectionString:
//             "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
//         procedure: "[dbo].[DBSourceProcedure]",
//     },
// }
describe("testing connection utill", () => {
    test("if the settingname was not 3 part splited with . the code should throw an error", async () => {
        let setting = {
            "Connections.sql": {
                connectionString: "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
                procedure: "[dbo].[DBSourceProcedure]",
                requestTimeout: 2000,
                testTimeOut: 1000,
            }
        }
        expect(() => ConnectionUtil.loadConnections(setting)).toThrow(InvalidConfigException)
    })
    test("if the settingname was not started with Connections dont have effect on retval", async () => {
        let setting = {
            "Connect.sql.RoutingData": {
                connectionString: "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
                procedure: "[dbo].[DBSourceProcedure]",
                requestTimeout: 2000,
                testTimeOut: 1000,
            }
        }
        const result = ConnectionUtil.loadConnections(setting)
        console.log(result)
        expect(result).toEqual([])
    })
    test("if the settingkey was not in the conditions throws an error", async () => {
        let setting = {
            "Connections.testDB.RoutingData": {
                connectionString: "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
                procedure: "[dbo].[DBSourceProcedure]",
                requestTimeout: 2000,
                testTimeOut: 1000,
            }
        }
        expect(() => ConnectionUtil.loadConnections(setting)).toThrow(InvalidConfigException)
    })
    // test("if key after . was `sql` and all things was okay return me sql connection info instance",async()=>{
    //     const constructorSpy = import.meta.jest.spyOn(SqlConnectionInfo.prototype, 'constructor');
    //     let setting = {
    //         "Connections.sql.RoutingData": {
    //             connectionString: "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
    //             procedure: "[dbo].[DBSourceProcedure]",
    //             requestTimeout: 2000,
    //             testTimeOut: 1000,
    //         }
    //     }
    //     const result =await ConnectionUtil.loadConnections(setting)
    //     console.log( result)
    //     expect(constructorSpy).toHaveBeenCalled();
    // })
    test("if key after . was `sql` and all things was okay return me sql connection info instance", async () => {
        let setting = {
            "Connections.sql.RoutingData": {
                connectionString: "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
                procedure: "[dbo].[DBSourceProcedure]",
                requestTimeout: 2000,
                testTimeOut: 1000,
            }
        }
        const result = ConnectionUtil.loadConnections(setting)
        expect(result[0] instanceof SqlConnectionInfo).toBe(true);
    })
    test("if key after . was `sql` and all things was okay return me correct sql connection info instance", async () => {
        let setting = {
            "Connections.sql.RoutingData": {
                connectionString: "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true",
                procedure: "[dbo].[DBSourceProcedure]",
                requestTimeout: 2000,
                testTimeOut: 1000,
            }
        }
        const result = ConnectionUtil.loadConnections(setting)
        console.log(result)
        expect(result[0]).toEqual({ "name": "routingdata", "settings": { "connectionString": "Server=.;Database=ClientApp;User Id=sa;Password=1234;trustServerCertificate=true", "procedure": "[dbo].[DBSourceProcedure]", "requestTimeout": 2000, "testTimeOut": 1000 } }
        );
    }) 
})

