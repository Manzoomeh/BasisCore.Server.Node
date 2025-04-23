import SqlConnectionInfo from "./models/Connection/SqlConnectionInfo.js";
let routing = {
  connectionString:
    "Server=192.168.96.10;Database=Domains;user Id=basiscore;password=BasisCore!1;trustServerCertificate=true",
  procedure: "cms_nodewebserver",
  requestTimeout: "10000000",
};

const sql = new SqlConnectionInfo("RR",routing)
   await sql.connectionPool.connect()
    
const result =await sql.loadDataAsync({
  
},null)