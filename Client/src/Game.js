import Board from './Board';
import Chat from './Chat';
import "./Game.css";


function Game(props) {
  const {color, username, opponentUsername} = props;
  return (
    <div className="Game">
      <Board color={color} username={username} opponentUsername={opponentUsername} />
      <Chat username={username} opponentUsername={opponentUsername} />
    </div>
  );
}
export default Game;
