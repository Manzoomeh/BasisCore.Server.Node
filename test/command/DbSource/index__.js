import sql from "mssql";

const sqlConfig = {
  user: "sa",
  password: "1234",
  database: "ClientApp",
  server: "localhost",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};
try {
  // make sure that any items are correctly URL encoded in the connection string
  await sql.connect(
    "Server=.;Database=temp;User Id=sa;Password=1234;trustServerCertificate=true"
  );
  //const result = await sql.query(`select top (10) * from PinMessageLogs`);
  //   const result =
  //     await sql.query(`exec [DBSourceProcedure]'<basis core="dbsource" source="basiscore" name="basisName" >
  // 	<member type="list" name="memberName" request="test_request"/>
  // 	<member type="view" name="memberName" request="test_request"/>
  // </basis>', 123`);

  const command = `<basis core="dbsource" source="basiscore" name="basisName" >
	<member type="list" name="memberName" request="test_request"/>
	<member type="view" name="memberName" request="test_request"/>
</basis>`;

  const tvp = new sql.Table(); // You can optionally specify table type name in the first argument.

  // Columns must correspond with type we have created in database.
  tvp.columns.add("name", sql.NVarChar(4000));
  tvp.columns.add("value", sql.NVarChar());

  // Add rows
  tvp.rows.add("hello tvp", "777"); // Values are in same order as columns.

  //https://www.npmjs.com/package/mssql#request
  const request = new sql.Request();
  // request.input("command", sql.Xml, command);
  // request.input("dmnid", sql.Int, 123);
  request.input("command", command);
  request.input("dmnid", 123);
  request.input("params", tvp);

  request.execute("[dbo].[DBSourceProcedure]", (err, result) => {
    // ... error checks

    //console.dir(result);
    //console.dir(result.recordsets[0]);
    console.log(result.recordsets.length); // count of recordsets returned by the procedure
    console.log(result.recordsets[0].length); // count of rows contained in first recordset
    console.log(result.recordsets[0]); // first recordset from result.recordsets
    console.log(result.recordsets[1]);
    console.log(result.returnValue); // procedure return value
    console.log(result.output); // key/value collection of output values
    console.log(result.rowsAffected); // array of numbers, each number represents the number of rows affected by executed statemens

    // ...
  });
  //console.dir(result);
} catch (err) {
  // ... error checks
  console.error(err);
}
