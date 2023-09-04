const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const socketLogic = require("./socketLogic");
const path = require("path");
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV === "production") {
  console.log("path = ", path.join(__dirname, "Client", "build"));
  app.use(express.static(path.join(__dirname, "Client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "Client", "build", "index.html"));
  });
}

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (client) => {
  console.log(`User connected: ${client.id}`);
  socketLogic.initializeGame(io, client);
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
