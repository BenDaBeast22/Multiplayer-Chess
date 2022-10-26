import Board from './Board';
import Chat from './Chat';
import { Component } from 'react';
import "./Game.css";
import GameState from './GameState';


class Game extends Component{
  constructor(props) {
    super(props);
    this.state = {score: [0, 0], message: "", resigned: false, opponentDisconnected: false};
    this.updateGameState = this.updateGameState.bind(this);
    this.resign = this.resign.bind(this);
    this.resetGameMessage = this.resetGameMessage.bind(this);
  }
  resign () {
    this.setState({resigned: true});
  }
  resetGameMessage () {
    this.setState({message: ""});
  }
  updateGameState(gameState) {
    const {checkmate, draw, resign, winner, disconnect } = gameState;
    let lossName = "checkmated";
    if (disconnect) {
      lossName = "disconnected";
      this.setState({opponentDisconnected: true});
    } else if (resign) { 
      lossName = "resigned"; 
    }
    if (checkmate && winner) {
      this.setState(st => ({
        score: [st.score[0] + 1, st.score[1]], 
        message: `Black ${lossName} ~ White is victorius`
      }));
    } else if (checkmate && !winner) {
      this.setState(st => ({
        score: [st.score[0], st.score[1] + 1],
        message: `White ${lossName} ~ Black is victorius`
      }));
    } else if (draw) {
      this.setState({message: "Draw"});
    }
  }
  render() {
    const {color, username, opponentUsername} = this.props;
    const {score, message, opponentDisconnected} = this.state;
    return (
      <div className="Game">
        <GameState color={color} username={username} opponentUsername={opponentUsername} score={score} message={message} resetMessage={this.resetGameMessage} opponentDisconnected={opponentDisconnected} />
        <Board color={color} username={username} opponentUsername={opponentUsername} updateGameState={this.updateGameState} />
        <Chat username={username} opponentUsername={opponentUsername} />
      </div>
    );
  }
}
export default Game;
