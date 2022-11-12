const net = require("net");
const EdgeMessage = require("./edgeMessage");

class EdgeUtil {
  static sendForEdgeAsync(ip, port, obj) {
    return new Promise((resolve, reject) => {
      var buffer = [];
      const client = new net.Socket()
        .on("data", (data) => buffer.push(data))
        .on("close", function () {
          const data = Buffer.concat(buffer);
          try {
            var msg = EdgeMessage.createFromBuffer(data);
            resolve(JSON.parse(msg.payload));
          } catch (e) {
            reject(e);
          }
        })
        .connect(port, ip, () => {
          const msg = EdgeMessage.createAdHocMessageFromObject(obj);
          msg.writeTo(client);
        });
    });
  }
}

module.exports = EdgeUtil;
