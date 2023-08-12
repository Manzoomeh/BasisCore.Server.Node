import HostManager from "./hostManager.js";
import { HostManagerOptions } from "./Models/model.js";
import fs from "fs"
import dotenv from "dotenv"
require("dotenv").config()
/** @type {HostManagerOptions} */
fs.readFile("./config/config.json",(err,data)=>{
if(err){
  throw new Error("please add config.json to config file in image")
}
const hostObject = JSON.parse(data)

const service = HostManager.fromJson(hostObject);
service.listen();
})

