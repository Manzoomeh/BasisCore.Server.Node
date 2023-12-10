import http from "http"

const server = http.createServer((req, res) => { 
  if (req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    console.log(1)
    const responseJSON = {
      message: "This is a test API response for a GET request.",
      timestamp: new Date().toISOString(),
    };

    res.end(JSON.stringify(responseJSON));
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
});

const PORT = 3000;

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
