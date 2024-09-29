import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8000 });

server.on("connection", (socket) => {
  console.log("Client connected");

  // Send an object every second
  const intervalId = setInterval(() => {
    const obj = {
      timestamp: new Date(),
      message: "Hello from the server!",
    };
    let objectt = {
      sources: [
        {
          options: {
            tableName: "user.list",
            mergeType: 1,
          },
          data: [obj],
        },
      ],
    };
    socket.send(JSON.stringify(objectt));
  }, 1000);

  // Clean up when the connection is closed
  socket.on("close", () => {
    clearInterval(intervalId);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8080");
