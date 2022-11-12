const http2 = require("http2");
const fs = require("fs");
const dayjs = require("dayjs");

const EdgeUtil = require("./edge/edgeUtil.js");

const edge_port = 1026;
const edge_ip = "127.0.0.1";

var request_id = 0;

const server = http2.createSecureServer({
  key: fs.readFileSync("test-cert/server.key"),
  cert: fs.readFileSync("test-cert/server.cert"),

  //pfx: fs.readFileSync("namayeshgah.ir.pfx"),
  //passphrase: "namayeshgah.ir",
});

server.on("error", (err) => console.error(err));
server.on("stream", async (stream, headers) => {
  try {
    console.log(headers[":path"]);

    headers["request-id"] = (++request_id).toString();
    headers["methode"] = headers[":method"].toLowerCase();
    headers["rawurl"] = headers["url"] = headers[":path"].substring(1);
    headers["full-url"] = `${headers[":authority"]}${headers[":path"]}`;
    headers["hostip"] = stream.session.socket.localAddress;
    headers["hostport"] = stream.session.socket.localPort.toString();
    headers["clientip"] = stream.session.socket.remoteAddress;

    var cms = {
      cms: {
        request: headers,
        cms: {
          date: dayjs().format("MM/DD/YYYY"),
          time: dayjs().format("HH:mm A"),
          date2: dayjs().format("YYYYMMDD"),
          time2: dayjs().format("HHmmss"),
          date3: dayjs().format("YYYY.MM.DD"),
        },
      },
    };

    const result = await EdgeUtil.sendForEdgeAsync(edge_ip, edge_port, cms);
    if (result.cms.webserver.filepath) {
      content = await fs.promises.readFile(result.cms.webserver.filepath);
      stream.respond({
        "content-type": result.cms.webserver.mime,
        ":status": result.cms.webserver.headercode.split(" ")[0],
      });
      stream.end(content);
    } else {
      stream.respond({
        "content-type": result.cms.webserver.mime,
        ":status": result.cms.webserver.headercode.split(" ")[0],
      });
      stream.end(result.cms.content);
    }
  } catch (ex) {
    console.error(ex);
    if (ex.code != "ERR_HTTP2_INVALID_STREAM") {
      stream.respond({
        ":status": 500,
      });
      stream.end(ex.toString());
    }
  }
});

server.listen(8000, "0.0.0.0");
