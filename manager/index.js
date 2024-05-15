import http from "http";
import router from "./router/router.js";
import url from "url";



const server = http.createServer((req, res) => {
  const triggerAddress = "/manager";
  if (req.url === triggerAddress) {
    let body = "";
    const urlObj = url.parse(req.url);
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      req.body = body.length > 0 ? JSON.parse(body) : undefined;
      req.query = urlObj.query;
      router(req, res);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found\n");
  }
});

const port = 3000;

server.listen(port, () => {
  console.log(`management Server running at http://localhost:${port}/`);
});
