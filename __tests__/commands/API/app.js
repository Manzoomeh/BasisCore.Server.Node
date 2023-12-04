const http = require("http");
const url = require("url");
const querystring = require("querystring");

const server = http.createServer((req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const queryParams = parsedUrl.query;

  // Set up CORS headers to allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle different HTTP methods
  switch (req.method) {
    case "GET":
      // Use query parameters for conditions
      if (queryParams.userId) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: `GET request to ${path}`,
            userId: queryParams.userId,
          })
        );
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: `GET request to ${path}`, queryParams })
        );
      }
      break;

    case "POST":
    case "PUT":
    case "PATCH":
      // Parse the request body
      let requestBody = "";
      req.on("data", (chunk) => {
        requestBody += chunk.toString();
      });

      req.on("end", () => {
        const body = querystring.parse(requestBody);

        if (body.username && body.email) {
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message: `${req.method} request to ${path}`,
              user: body,
            })
          );
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid request body" }));
        }
      });
      break;

    case "DELETE":
      if (queryParams.userId) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: `DELETE request to ${path}`,
            deletedUserId: queryParams.userId,
          })
        );
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing userId parameter" }));
      }
      break;

    default:
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      break;
  }
});

const port = 3000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
