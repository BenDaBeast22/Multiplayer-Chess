import React, { useState} from 'react';
import { useParams } from 'react-router-dom';
import Game from '../Game';
import "./JoinGameRoom.css";
const socket = require("../connections/socket").socket;
const WHITE = true;
const BLACK = false;

const JoinGameRoom = (props) => {
  const [username, setUsername] = useState("");
  const [enteredUsername, setEnterUsername] = useState(false);
  const { gameId } = useParams();

  const handleChange = e => {
    setUsername(e.target.value);
  }

  const handleSubmit = e => {
    e.preventDefault();
    console.log("game id = " + gameId);
    socket.emit("JoinGame", gameId);
    setEnterUsername(true);
  }

  return (
    <>
      {
        enteredUsername?
          <Game color={BLACK}/>
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