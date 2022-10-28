import { io } from 'socket.io-client';
let socket;
// if (process.env.NODE_ENV === "production") socket = io();
// else socket = io("http://localhost:8000");
socket = io("http://localhost:8000");

socket.on("CreateNewGame", statusUpdate => {
  console.log(`Created new game! Game Id: ${statusUpdate.gameId} Socket Id: ${statusUpdate.socketId}`);
});

export {socket};
