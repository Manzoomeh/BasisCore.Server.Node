import net from "net";

const port = 9090;

const server = net.createServer((socket) => {
  console.log("Client connected");

  socket.on("data", (message) => {
    const strData = message.toString();
    const data = JSON.parse(strData);
    console.log("Received: ", data);
    const result = {
      Replace: true,
      sources: [
        {
          data: { Time: 1, Percent: 1234 },
        },
      ],
    };
    socket.write(JSON.stringify(result));
    socket.destroy();
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });

  socket.on("error", (error) => {
    console.log(`Socket Error: ${error.message}`);
  });
});

server.on("error", (error) => {
  console.log(`Server Error: ${error.message}`);
});

server.listen(port, () => {
  console.log(`TCP socket server is running on port: ${port}`);
});
