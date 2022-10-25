import './App.css';
import Game from './Game';
import React, {useEffect, useState} from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateGame from './gameRoom/CreateGame';
import JoinGameRoom from './gameRoom/JoinGameRoom';
import PracticeBoard from './PracticeBoard';

const WHITE = true;
const BLACK = false;
/* Flow
  1. Host goes to root
  2. Client asks for username
  3. Client creates a game room and outputs link to send to friend
  4. Friend enters link
  5. Friend enters username
  6. Friend joins gameroom
  7. Both host and friend sent to chess game
*/

function App() {
  const [creatorUsername, setCreatorUsername] = useState('');
  const [playerUsername, setPlayerUsername] = useState('');
  
  const handleSetCreatorUsername = newUsername => {
    setCreatorUsername(newUsername);
  }

  const handleSetPlayerUsername = newUsername => {
    setPlayerUsername(newUsername);
  }
  useEffect(() => {
    console.log("Opponent Username ===== ", playerUsername);
  }, [playerUsername]);

  return (
    <Routes>
      <Route path="/" element={<CreateGame setCreatorUsername={handleSetCreatorUsername} setPlayerUsername={handleSetPlayerUsername}/>} />
      <Route path="/practice" element={<PracticeBoard />} />
      <Route path="/game/:gameId" element={<JoinGameRoom />} />
      <Route path="/game/creator/:gameId" element={<Game color={WHITE} username={creatorUsername} opponentUsername={playerUsername}/>}/>
      <Route path="*" element={<h1>401 Error</h1>} />
    </Routes>
  );
}
export default App;
