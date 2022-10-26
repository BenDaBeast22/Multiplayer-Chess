import React, { Component } from 'react';
import "./GameState.css";

class GameState extends Component {
  render() {
    const { username, opponentUsername, score, message } = this.props;
    const scoreText = `${score[0]} - ${score[1]}`;
    return (
      <div className="GameState">
        <p className="username">BenDaBeast</p>
        <div className='score'><strong>{scoreText}</strong></div>
        <div className='state'><em>{message}</em></div>
        <button className="resignButton">Resign</button>
        <button className="rematchButton">Rematch</button>
        <p className="opponentUsername">Rehan</p>
      </div>
    );
  }
}

export default GameState;