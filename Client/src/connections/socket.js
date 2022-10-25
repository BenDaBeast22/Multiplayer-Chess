import { io } from 'socket.io-client';
// const URL = "http://localhost:8000";

const socket = io();

socket.on("CreateNewGame", statusUpdate => {
  console.log(`Created new game! Game Id: ${statusUpdate.gameId} Socket Id: ${statusUpdate.socketId}`);
});

export {socket};
