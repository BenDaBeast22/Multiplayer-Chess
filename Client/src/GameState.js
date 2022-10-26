import React, { Component } from 'react';
import "./GameState.css";
import { Howl } from 'howler';
const socket = require("./connections/socket").socket;

class GameState extends Component {
  constructor (props) {
    super(props);
    this.state = {rematchWaiting: false, rematchRequest: false}
    this.resign = this.resign.bind(this);
    this.rematch = this.rematch.bind(this);
  }
  componentDidMount() {
    socket.on("rematch request", () => {
      this.playSound("/soundEffects/rematch.mp3");
      this.setState({rematchRequest: true});
    });

    socket.on("rematch accepted", () => {
      this.setState({rematchWaiting: false, rematchRequest: false});
      this.props.resetMessage();
    });
  }
  playSound(src) {
    const sound = new Howl({src, volume: 0.2});
    sound.play();
  }
  resign() {
    const { color } = this.props;
    socket.emit("resign", color);
  }
  rematch() {
    const { rematchRequest, rematchWaiting } = this.state;
    if (rematchWaiting) return;
    if (rematchRequest) {
      socket.emit("rematch accepted");
      socket.emit("reset game");
      this.setState({rematchRequest: false})
    } else {
      socket.emit("rematch request");
      this.setState({rematchWaiting: true});
    }
  }
  render() {
    const { rematchWaiting, rematchRequest } = this.state;
    const { username, opponentUsername, score, message, opponentDisconnected } = this.props;
    const scoreText = `${score[0]} - ${score[1]}`;
    let rematch = "Rematch";
    let rematchClass = "";
    if (rematchWaiting) {
      rematch = "Waiting for opponent";
      rematchClass = "rematchRequest";
      
    } else if (rematchRequest) {
      rematch = "Accept Rematch";
      rematchClass = "rematchRequest";
    }
    return (
      <div className="GameState">
        <p className="username">{username}</p>
        <div className='score'><strong>{scoreText}</strong></div>
        <div className='state'><em>{message}</em></div>
        <button className="resignButton" onClick={this.resign}>Resign</button>
        <button className={`rematchButton ${rematchClass}`} disabled={!message || opponentDisconnected} onClick={this.rematch}>{rematch}</button>
        <p className="opponentUsername">{opponentUsername}</p>
      </div>
    );
  }
}

export default GameState;