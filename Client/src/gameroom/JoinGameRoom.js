import React, { useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import Game from '../game/Game';
import { socket } from '../connections/socket';

const WHITE = true;
const BLACK = false;

const JoinGameRoom = (props) => {
  const [username, setUsername] = useState("");
  const [enteredUsername, setEnterUsername] = useState(false);
  const [opponentUsername, setOpponentUsername] = useState(false);
  const { gameId } = useParams();

  const handleChange = e => {
    setUsername(e.target.value);
  }

  const handleSubmit = e => {
    e.preventDefault();
    console.log("game id = " + gameId);
    const join = {gameRoomId: gameId, username}
    socket.emit("JoinGame", join);
    setEnterUsername(true);
  }
  useEffect(() => {
    socket.on("creator username", creatorUsername => {
      setOpponentUsername(creatorUsername);
    })
  }, [socket])
  return (
    <>
      {
        enteredUsername && opponentUsername?
          <Game username={username} opponentUsername={opponentUsername} color={BLACK}/>
        :
          <div className='EnterUsername'>
            <form onSubmit={handleSubmit}>
              <label>Enter Your Username:</label>
              <input value={username} onChange={handleChange}></input>
              <button className="Submit">Submit</button>
            </form>
          </div>    
      }
    </>
  );
}

export default JoinGameRoom;