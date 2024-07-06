import EdgeConnectionInfo from "../../../Models/Connection/EdgeConnectionInfo.js";

let array = [];
for (let i = 1; i < 2; i++) {
  array.push(new EdgeConnectionInfo("test", { endpoint: "192.168.96.76:2071" }));
}
const result = await Promise.all(
  array.map((element) => {
    return element.loadDataAsync({
      command: "<basis core='dbsource' name='db' run='atserver' id='cat' lid='1' mid='20' source='basiscore' ><member name='headercat' request='cat' type='tree' ></member></basis>",
      dmnid: 4235,
      params: {}
    });
  })
);

console.log(result);
