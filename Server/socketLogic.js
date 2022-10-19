let io;
let socket;

function initializeGame(sio, gameSocket) {
  // initialize global variables
  io = sio;
  socket = gameSocket;

  // define socket listeners
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

exports.initializeGame = initializeGame;