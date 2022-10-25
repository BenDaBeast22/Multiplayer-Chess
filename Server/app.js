const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
const socketLogic = require("./socketLogic");
const PORT = process.env.PORT || 8000;

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static('build'));
//   app.get
// }

app.use(cors());
// app.use((req, res) => res.sendFile(path.resolve('Server', 'build', 'index.html')))

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