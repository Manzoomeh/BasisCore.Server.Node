import MongoConnectionInfo from "./../../../Models/Connection/MongoConnectionInfo.js"
const mongo = new MongoConnectionInfo("test",{
  endpoint: "mongodb://127.0.0.1:27017",
  dataBase : "mydatabase",
  collection : "customers",
  method : "find",
  // query : {address:"Canyon 123"}
  query : {}
})

console.log(await mongo.loadDataAsync())
console.log(await mongo.loadDataAsync())
console.log(await mongo.testConnectionAsync())