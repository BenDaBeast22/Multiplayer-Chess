import Board from './Board';
import Chat from './Chat';
import "./Game.css";

function Game(props) {
  const {color} = props;
  return (
    <div className="Game">
      <Board color={color}/>
      <Chat />
    </div>
  );
}
export default Game;
