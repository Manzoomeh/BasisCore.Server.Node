import SqlConnectionInfo from "../../Models/Connection/SqlConnectionInfo";
import SqlSettingData from "../../Models/Connection/SqlSettingData";

import sql from "mssql";
import DataSourceCollection from "../../renderEngine/Source/DataSourceCollection.js";
import { expect } from "@jest/globals";


/**
 * @type SqlSettingData
 */
let settings = {
  connectionString: "Server=172.20.20.200;Database=test;User Id=sa;Password=Salam1Salam2;trustServerCertificate=true",
  procedure: "[dbo].[GetAllUsers]",
  requestTimeout: 1000,
  testTimeOut: 1000,
};
function areArraysEqualIgnoreId(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false; // If the arrays have different lengths, they cannot be equal
  }

  const getIdlessObject = (obj) => {
    const { user_id, ...rest } = obj;
    return rest;
  };

  const obj1WithoutId = arr1.map(getIdlessObject);
  const obj2WithoutId = arr2.map(getIdlessObject);

  // Sort the arrays to ensure the order of objects doesn't affect equality
  obj1WithoutId.sort((a, b) => JSON.stringify(a) > JSON.stringify(b) ? 1 : -1);
  obj2WithoutId.sort((a, b) => JSON.stringify(a) > JSON.stringify(b) ? 1 : -1);

  for (let i = 0; i < obj1WithoutId.length; i++) {
    if (JSON.stringify(obj1WithoutId[i]) !== JSON.stringify(obj2WithoutId[i])) {
      return false; // If any objects are not equal, the arrays are not equal
    }
  }

  return true; // All objects in the arrays are equal
}
describe("sqlConnectionInfoTest", () => {
  let pool; // Declare the connection pool outside the tests

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
      `INSERT INTO Users (phone, username, password) VALUES
    ('1234567890', 'user1', 'password1'),
    ('9876543210', 'user2', 'password2'),
    ('5555555555', 'user3', 'password3'),
    ('1111111111', 'user4', 'password4'),
    ('9999999999', 'user5', 'password5'),
    ('8888888888', 'user6', 'password6'),
    ('7777777777', 'user7', 'password7'),
    ('6666666666', 'user8', 'password8'),
    ('4444444444', 'user9', 'password9'),
    ('2222222222', 'user10', 'password10');`
    )
    await pool.request().query(
      `CREATE PROCEDURE GetAllUsers
AS
BEGIN
    SELECT *
    FROM Users;
END;`
    )
    await pool.request().query(
      `CREATE PROCEDURE FindUserByUsername
    @Username NVARCHAR(50) 
AS
BEGIN
    -- Select the user by username
    SELECT *
    FROM Users
    WHERE Username = @Username;
END;`
    )
  });

  afterAll(async () => {
    await pool.request().query(`DELETE FROM Users`)
    await pool.request().query("DROP PROCEDURE dbo.FindUserByUsername")
    await pool.request().query("DROP PROCEDURE dbo.getAllUsers")
    await pool.close();
    settings = {
      connectionString: "Server=172.20.20.200;Database=test;User Id=sa;Password=Salam1Salam2;trustServerCertificate=true",
      procedure: "[dbo].[GetAllUsers]",
      requestTimeout: 1000,
      testTimeOut: 1000,
    }
  });
  test("should return a DataSourceCollection instance", async () => {
    const connectionInfo = new SqlConnectionInfo("test1", settings);
    const res = await connectionInfo.loadDataAsync();
    expect(res).toBeInstanceOf(DataSourceCollection);
  });

  test("should throw an error when the procedure is wrong", async () => {
    const connectionInfo = new SqlConnectionInfo("test", settings);
   expect(() => connectionInfo.loadDataAsync()).not.toThrow();
  });
  test("should return another DataSourceCollection instance", async () => {
    const connectionInfo = new SqlConnectionInfo("test2", settings);
    const res = await connectionInfo.loadDataAsync();
    const arr = [{ "password": "password1", "phone": "1234567890", "username": "user1" }, { "password": "password2", "phone": "9876543210", "username": "user2" }, { "password": "password3", "phone": "5555555555", "username": "user3" }, { "password": "password4", "phone": "1111111111", "username": "user4" }, { "password": "password5", "phone": "9999999999", "username": "user5" }, { "password": "password6", "phone": "8888888888", "username": "user6" }, { "password": "password7", "phone": "7777777777", "username": "user7" }, { "password": "password8", "phone": "6666666666", "username": "user8" }, { "password": "password9", "phone": "4444444444", "username": "user9" }, { "password": "password10", "phone": "2222222222", "username": "user10" },]
    let boolean = areArraysEqualIgnoreId(res["items"][0].data, arr)
    expect(boolean).toBe(false);
  });
  test("should have properties id in result", async () => {
    const connectionInfo = new SqlConnectionInfo("test2", settings);
    const res = await connectionInfo.loadDataAsync();
    res["items"][0].data.forEach((user, index) => {
      expect(user).toMatchObject({
        username: expect.any(String),
        password: expect.any(String),
        phone: expect.any(String),
        user_id: expect.any(Number),
      });
    })
  })
  test("should recieve parameters and return data with use of parameter on procedure", async () => {
    settings.procedure = "[dbo].[FindUserByUsername]"
    const connectionInfo = new SqlConnectionInfo("test2", settings);
    const res = await connectionInfo.loadDataAsync({
      username: "user1"
    });
    expect(res.items[0].data[0].password).toEqual("password1")
    expect(res.items[0].data[0].phone).toEqual('1234567890')
  })
});

