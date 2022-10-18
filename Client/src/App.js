import './App.css';
import Board from './Board';
import Chat from './Chat';

import io from 'socket.io-client';
const URL = "http://localhost:3000";
const socket = io(URL);

function App() {
  return (
    <div className="App">
      <Board />
      <Chat />
    </div>
  );
}
export default App;
