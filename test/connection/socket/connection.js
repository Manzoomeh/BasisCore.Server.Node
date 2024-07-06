import SocketConnectionInfo from "./../../../models/Connection/SocketConnectionInfo.js";

const socket = new SocketConnectionInfo("TEST", { endPoint: "127.0.0.1:9090" });
const encoder = new TextEncoder();
const byteMessage = encoder.encode(JSON.stringify("tessssst"));
const result = await socket.loadDataAsync({ byteMessage }, null);
console.log("##############3", result.items[0].data);
