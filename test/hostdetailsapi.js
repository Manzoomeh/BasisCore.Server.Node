import http from "http"
// Create the server
const server = http.createServer((req, res) => {
  // Set the response header to indicate JSON content
  res.writeHead(200, { 'Content-Type': 'application/json' });
    const date = new Date()
  // Prepare the JSON data
  const data = {
    defaultCacheExpire:1,
    isCachingAllowed:true,
    expireAt:date.toISOString(),
    profiles:[1,2,3],
    defaultIndexID:1,
    domains:["google.com"],
  };

  // Send the JSON response
  res.end(JSON.stringify(data));
});

// Start the server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
