import Board from './Board';
import Chat from './Chat';
import { Component } from 'react';
import "./Game.css";
import GameState from './GameState';
import { Howl } from 'howler';
import { socket } from './connections/socket';


class Game extends Component {
  constructor(props) {
    super(props);
    this.state = {score: [0, 0], message: "", resigned: false, opponentDisconnected: false, gameover: false, firstMove: false};
    this.updateGameState = this.updateGameState.bind(this);
    this.resign = this.resign.bind(this);
    this.resetGameMessage = this.resetGameMessage.bind(this);
  }
  componentDidMount () {
    this.playSound("/soundEffects/win.mp3");
    socket.on("reset game", () => {
      this.setState({gameEnd: false, firstMove: false})
    });
    socket.on("first move", () => {
      this.setState({firstMove: true})
    });
  }
  playSound (src) {
    const sound = new Howl({src, volume: 0.2});
    sound.play();
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
    this.setState({gameover: true});
  }
  render() {
    const {color, username, opponentUsername} = this.props;
    const {score, message, opponentDisconnected, gameover, firstMove} = this.state;
    return (
      <div className="Game">
        <GameState color={color} username={username} opponentUsername={opponentUsername} score={score} message={message} resetMessage={this.resetGameMessage} opponentDisconnected={opponentDisconnected} gameover={gameover} firstMove={firstMove}/>
        <Board color={color} username={username} opponentUsername={opponentUsername} updateGameState={this.updateGameState} />
        <Chat username={username} opponentUsername={opponentUsername} />
      </div>
    );
  }
}
export default Game;
