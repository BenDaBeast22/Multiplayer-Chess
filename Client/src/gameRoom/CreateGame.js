import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import "./CreateGame.css";
import {v4 as uuid} from 'uuid';
const socket = require("../connections/socket").socket;

class CreateGame extends Component {
  constructor(props) {
    super(props);
    this.state = {username: "", setUsername: false, opponentJoined: false, gameId: ''}
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(evt) {
    this.setState({username: evt.target.value});
  }
  handleSubmit(evt) {
    evt.preventDefault();
    if (this.state.username.length) {
      this.setState({setUsername: true});
      const gameId = uuid();
      this.setState({gameId});
      socket.emit("CreateNewGame", gameId); 
    } 
  }
  render() {
    const { username, setUsername, opponentJoined, gameId } = this.state;

    return (
      <>
        {
          !setUsername? 
            <div className='EnterUsername'>
              <form onSubmit={this.handleSubmit}>
                <label>Enter Your Username:</label>
                <input value={username} onChange={this.handleChange}></input>
                <button className="Submit">Submit</button>
              </form>
            </div>
          : !opponentJoined ? 
            <div className="WaitingRoom">
              <p>Get friend to paste link to join game!</p>
              <a>{`http:localhost:3000/game/${gameId}`}</a>
              <h3>Waiting for opponent to join...</h3>
            </div>
          :
            <Navigate to="/game"/>
        }
      </>
    );
  }
}

export default CreateGame;