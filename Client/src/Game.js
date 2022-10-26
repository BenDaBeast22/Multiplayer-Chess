import Board from './Board';
import Chat from './Chat';
import { Component } from 'react';
import "./Game.css";
import GameState from './GameState';


class Game extends Component{
  constructor(props) {
    super(props);
    this.state = {score: [0, 0], message: ""};
    this.updateGameState = this.updateGameState.bind(this);
  }
  updateGameState(gameState) {
    debugger;
    const {color} = this.props;
    const {checkmate, draw, resign, winner } = gameState;
    const colorName = color? "White" : "Black";
    const opponentColorName = color? "Black" : "White";
    const lossName = resign? "resigned" : "checkmated"
    if (checkmate && winner) {
      this.setState(st => ({
        score: [st.score[0] + 1, st.score[1]], 
        message: `${opponentColorName} ${lossName} ~ ${colorName} is victorius`
      }));
    } else if (checkmate && !winner) {
      this.setState(st => ({
        score: [st.score[0], st.score[1] + 1],
        message: `${colorName} ${lossName} ~ ${opponentColorName} is victorius`
      }));
    } else if (draw) {
      this.setState({message: "Draw"});
    }
  }
  render() {
    const {color, username, opponentUsername} = this.props;
    const {score, message} = this.state;
    return (
      <div className="Game">
        <GameState username={username} opponentUsername={opponentUsername} score={score} message={message}/>
        <Board color={color} username={username} opponentUsername={opponentUsername} updateGameState={this.updateGameState} />
        <Chat username={username} opponentUsername={opponentUsername} />
      </div>
    );
  }
}
export default Game;
