const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const socketLogic = require("./socketLogic");
const PORT = 8000;

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("<h1>Chess Server</h1>");
});

io.on("connection", (client) => {
  console.log(`User connected: ${client.id}`);
  socketLogic.initializeGame(io, client);
});

server.listen(PORT, () => {
 console.log(`Listening on port ${PORT}`);
});