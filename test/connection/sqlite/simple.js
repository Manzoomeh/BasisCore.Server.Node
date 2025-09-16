import SqliteConnectionInfo from "./../../../models/Connection/SqliteConnectionInfo.js";
const Sqlite = new SqliteConnectionInfo("test", {
  dbPath: "a.test.db",
  query: "SELECT * FROM table_name",
});

console.log(await Sqlite.loadDataAsync());
console.log(await Sqlite.loadDataAsync());
