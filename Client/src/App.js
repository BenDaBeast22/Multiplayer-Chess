import Game from './game/Game';
import React, {useEffect, useState} from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateGame from './gameroom/CreateGame';
import JoinGameRoom from './gameroom/JoinGameRoom';
import PracticeBoard from './practice/PracticeBoard';

/* Flow
  1. Host goes to root
  2. Client asks for username
  3. Client creates a game room and outputs link to send to friend
  4. Friend enters link
  5. Friend enters username
  6. Friend joins gameroom
  7. Both host and friend sent to chess game component (The host is WHITE and the friend is BLACK)
*/

const WHITE = true;
const BLACK = false;

function App() {
  const [creatorUsername, setCreatorUsername] = useState('');
  const [playerUsername, setPlayerUsername] = useState('');
  
  const handleSetCreatorUsername = newUsername => {
    setCreatorUsername(newUsername);
  }

  const handleSetPlayerUsername = newUsername => {
    setPlayerUsername(newUsername);
  }

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
