import EdgeConnectionInfo from "./models/Connection/EdgeConnectionInfo.js";
let routing = {
    endpoint: "192.168.96.170:2001",
  };;

const edge = new EdgeConnectionInfo("RR",routing)
    
const result =await edge.loadDataAsync({
  command : "<basis core='dbsource' name='db' source='trustloginapi' useragent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' ip='185.44.36.77'><member name='dmntoken' type='scalar' request='dmntoken'></member></basis>",
   dmnid : 25,
},null)
const result2 =await edge.loadDataAsync({
  command : "<basis core='dbsource' name='db' run='atserver' useragent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' ip='185.44.38.83' source='trustloginapi' ><member name='dmntoken' type='scalar' request='dmntoken' ></member></basis>",
   dmnid : 25,
},null)
    console.log(result.items[0].data)
    console.log(result2.items[0].data)