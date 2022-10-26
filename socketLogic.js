let gamesInSession = [];
const WHITE = true;
const BLACK = false;

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
  socket.on("rematch request", rematchRequest);
  socket.on("rematch accepted", rematchAccepted);
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
    socket.color = WHITE;
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
      socket.color = BLACK;
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
    const {gameRoomId, msg, username} = chatMessage;
    const response = {msg, username}
    console.log("Chat Message = ", chatMessage);
    io.to(gameRoomId).emit("ChatMessage", response);
  }

  function resign (color) {
    const resign = {resignColor: color, disconnect: false}
    io.to(socket.gameId).emit("player resigned", resign);
  }
  
  function onDisconnect() {
    const i = gamesInSession.indexOf(socket);
    gamesInSession.splice(i, 1);
    console.log('user disconnected');
    const resign = {resignColor: socket.color, disconnect: true}
    socket.to(socket.gameId).emit("player resigned", resign);
  }

  function rematchRequest () {
    socket.to(socket.gameId).emit("rematch request");
  }

  function rematchAccepted () {
    console.log("rematch Accepted");
    io.to(socket.gameId).emit("rematch accepted");
  }

  function resetGame() {
    console.log("Reset game "+ socket.gameId);
    io.to(socket.gameId).emit("reset game", {});
  }
}

exports.initializeGame = initializeGame;