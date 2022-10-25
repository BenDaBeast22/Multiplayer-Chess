let gamesInSession = [];

function initializeGame(sio, gameSocket) {
  // initialize global variables
  let io = sio;
  let socket = gameSocket;

  gamesInSession.push(socket);
  console.log("Games In Session = ", gamesInSession.length)

  // define socket listeners
  socket.on("CreateNewGame", createNewGame);
  socket.on("JoinGame", playerJoinGame);
  socket.on("send creator username", getCreatorUsername);
  socket.on("SendMessage", sendMessage);
  socket.on("new move", newMove);
  socket.on("resign", resign);
  socket.on('disconnect', onDisconnect);
  socket.on('reset game', resetGame);

  function newMove(move) {
    const { state, gameRoomId, moveInfo } = move;
    console.log("New Move: Socket = ", socket);
    socket.to(gameRoomId).emit("opponent move", {state, moveInfo});
  }
  
  function createNewGame(gameRoomId) {
    console.log("Created Gamroom: ", gameRoomId);
    socket.join(gameRoomId);
    socket.gameId = gameRoomId;
    console.log("socket = ", socket);
    io.emit("CreateNewGame", {gameId: gameRoomId, socketId: socket.id})
  }
  
  function playerJoinGame(join) {
    const {gameRoomId, username} = join;
    console.log("gameroomid = ", gameRoomId);
    console.log("Attempting to join game")
    console.log("JoIn = ", join);
    // console.log(io.sockets.adapter);
  
    const room = io.sockets.adapter.rooms.get(gameRoomId);
    
    // If room does not exist send error message
    if (room === undefined) {
      io.emit("statusMessage", "Room does not exist");
      return;
    } 
    else if (room.size < 2) {
      socket.gameId = gameRoomId;
      socket.join(socket.gameId);
      console.log(room);
      console.log("emiiting message to others");
      socket.to(gameRoomId).emit("OpponentJoined", username);
      // console.log(io.sockets.adapter);
    }
    else {
      console.log("Room is lit");
      // console.log(room);
    }
  }

  function getCreatorUsername (username) {
    socket.to(socket.gameId).emit("creator username", username);
  }
  
  function sendMessage (chatMessage) {
    const {gameRoomId, msg} = chatMessage;
    console.log("Chat Message = ", chatMessage);
    io.to(gameRoomId).emit("ChatMessage", msg);
  }

  function resign (gameRoomId) {
    socket.to(gameRoomId).emit("opponent resigned", {});
  }
  
  function onDisconnect() {
    const i = gamesInSession.indexOf(socket);
    gamesInSession.splice(i, 1);
    console.log('user disconnected');
  }

  function resetGame() {
    console.log("Reset game "+ socket.gameId);
    io.to(socket.gameId).emit("reset game", {});
  }
}

exports.initializeGame = initializeGame;