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
  socket.on("SendMessage", sendMessage);
  socket.on("new move", newMove);

  socket.on('move', board => {
    console.log(board);
    io.emit('move', board);
  });
  socket.on('disconnect', onDisconnect);

  function newMove(move) {
    const { state, gameRoomId, moveInfo } = move;
    console.log("New Move: Socket = ", socket);
    socket.to(gameRoomId).emit("opponent move", {state, moveInfo});
  }
  
  function createNewGame(gameRoomId) {
    console.log("Created Gamroom: ", gameRoomId);
    socket.join(gameRoomId);
    io.emit("CreateNewGame", {gameId: gameRoomId, socketId: socket.id})
  }
  
  function playerJoinGame(gameRoomId) {
    console.log("gameroomid = ", gameRoomId);
    // console.log(io.sockets.adapter);
  
    const room = io.sockets.adapter.rooms.get(gameRoomId);
    
    // If room does not exist send error message
    if (room === undefined) {
      io.emit("statusMessage", "Room does not exist");
      return;
    } 
    else if (room.size < 2) {
      socket.join(gameRoomId);
      console.log(room);
      console.log("emiiting message to others");
      io.to(gameRoomId).emit("OpponentJoined", gameRoomId);
      // console.log(io.sockets.adapter);
    }
    else {
      console.log("Room is lit");
      // console.log(room);
    }
  }
  
  function sendMessage (chatMessage) {
    const {gameRoomId, msg} = chatMessage;
    console.log("Chat Message = ", chatMessage);
    io.to(gameRoomId).emit("ChatMessage", msg);
  }
  
  function onDisconnect() {
    const i = gamesInSession.indexOf(socket);
    gamesInSession.splice(i, 1);
    console.log('user disconnected');
  }
}

exports.initializeGame = initializeGame;