import SqlConnectionInfo from "./../../../Models/Connection/SqlConnectionInfo.js";
const Sql = new SqlConnectionInfo("test", {
  connectionString:
    "Server=.;Database=test;User Id=sa;Password=1234;trustServerCertificate=true",
  procedure: "[dbo].[cms]",
});
console.log(await Sql.testConnectionAsync());
