import './App.css';
import Game from './Game';
import React, {useState} from 'react';
import { Route, Routes } from 'react-router-dom';
import CreateGame from './CreateGame';

function App() {
  const [username, setUsername] = useState('');
  return (
    <Routes>
      <Route path="/" element= {<CreateGame />} />
      <Route path="/game" element={<Game />} />
      <Route path="*" element={<h1>401 Error</h1>} />
    </Routes>
  );
}
export default App;
