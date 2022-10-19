let io;
let socket;

function initializeGame(sio, gameSocket) {
  // initialize global variables
  io = sio;
  socket = gameSocket;

  // define socket listeners
  socket.on("CreateNewGame", createNewGame);

  socket.on("JoinGame", playerJoinGame);

  socket.on("chat message", msg => {
    io.emit('chat message', msg);
  });
  socket.on('move', board => {
    console.log(board);
    io.emit('move', board);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
}

function createNewGame(gameRoomId) {
  console.log("Created Gamroom: ", gameRoomId);
  io.emit("CreateNewGame", {gameId: gameRoomId, socketId: socket.id})
  socket.join(gameRoomId);
}

function playerJoinGame(gameRoomId) {
  console.log("gameroomid = ", gameRoomId);
  console.log(io.sockets.adapter);

  const room = io.sockets.adapter.rooms.get(gameRoomId);
  
  // If room does not exist send error message
  if (room === undefined) {
    io.emit("statusMessage", "Room does not exist");
    return;
  } 
  else if (room.size < 2) {
    socket.join(gameRoomId);
    console.log(io.sockets.adapter);
  }
  else {
    console.log("Room is lit");
    console.log(room);
  }


}

exports.initializeGame = initializeGame;