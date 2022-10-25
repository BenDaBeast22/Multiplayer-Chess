import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
  componentDidMount() {
    socket.on("OpponentJoined", opponentUsername => {
      console.log(`Opponent joined the game: ${opponentUsername}`);
      this.props.setCreatorUsername(this.state.username);
      this.props.setPlayerUsername(opponentUsername);
      socket.emit("send creator username", this.state.username);
      this.setState({opponentJoined: true});
    });
  }
  handleChange(evt) {
    this.setState({username: evt.target.value});
  }
  handleSubmit(evt) {
    evt.preventDefault();
    if (this.state.username.length) {
      console.log(evt.target);
      console.log("Username should now be = ", this.state.username);
      this.setState({setUsername: true});
      const gameId = uuid();
      this.setState({gameId});
      socket.emit("CreateNewGame", gameId); 
    } 
  }
  render() {
    const { username, setUsername, opponentJoined, gameId } = this.state;
    const gameLink = `http:localhost:3000/game/${gameId}`;
    return (
      <>
        {
          !setUsername? 
            <div className='EnterUsername'>
              <form onSubmit={this.handleSubmit}>
                <label>Enter Your Username:</label>
                <input name="username" value={username} onChange={this.handleChange}></input>
                <button className="Submit">Submit</button>
                <div className="Practice"><Link to="/practice">Practice</Link></div>
              </form>
            </div>
          : !opponentJoined ? 
            <div className="WaitingRoom">
              <div className="container">
                <div className="copyLink">
                  <p>Copy the link and send it to a friend to begin the game!</p>
                  <a className="" onClick={() => navigator.clipboard.writeText(gameLink)}><i className="fa-regular fa-copy"></i> Copy Link</a>
                </div>
                <h3 className="WaitingMessage">Waiting for opponent to join...</h3>
                <div className="lds-facebook"><div></div><div></div><div></div></div>
              </div>
            </div>
          :
            <Navigate to={`/game/creator/${gameId}`}/>
        }
      </>
    );
  }
}

export default CreateGame;