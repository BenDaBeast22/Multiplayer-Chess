import './Board.css'
import React from 'react'
import Square from './Square';
import {Piece, King} from './Pieces';
import { arrayEquals, setupBoard } from './Helpers';
import ChessGame from './ChessGame';

const BLACK = false
const WHITE = true

let Game = new ChessGame();

class Board extends React.Component {
  static defaultProps = {
    nRows: 8,
    nCols: 8,
  }
  constructor(props) {
    super(props);
    this.state = {
      board: setupBoard(),
      lastSelectedPiecePos: false,
      turn: WHITE,
      legalMoves: [],
      kingPos: [[0, 4], [7, 4]],
      inCheck: false,
      checkmate: false,
      winner: false,
      castleCheck: [[true, true, true], [true, true, true]],
      lastEnPassant: false,
      draw: false
    }
    this.resetBoard = this.resetBoard.bind(this);
  }
  // Checks to see if another piece is selected
  changeSelection(board, selectedPiece, newPos) {
    const [r, c] = newPos;
    const [or, oc] = selectedPiece;
    if ((board[or][oc].type === board[r][c].type) && !(or === r && oc === c)) {
      return true;
    }
    return false;
  }
  // Called when player clicks on a piece
  selectPiece(selectedPiecePos) {
    const [r, c] = selectedPiecePos;
    const {board, lastSelectedPiecePos, kingPos, inCheck, castleCheck, lastEnPassant, draw, turn} = this.state;
    // If a move is made
    if (lastSelectedPiecePos && !this.changeSelection(board, lastSelectedPiecePos, selectedPiecePos)) {
      if (arrayEquals(selectedPiecePos, lastSelectedPiecePos)){
        this.setState({lastSelectedPiecePos: false, legalMoves: []})
        return;
      } 
      const [or, oc] = lastSelectedPiecePos;
      const lastSelectedPiece = board[or][oc];
      const retBoard = Game.move(board, lastSelectedPiecePos, selectedPiecePos, lastSelectedPiece, kingPos, inCheck, castleCheck, lastEnPassant, draw);
      if (retBoard.checkmate) {
        this.setState({winner: lastSelectedPiece.type, checkmate: true, inCheck: true, legalMoves: [], lastSelectedPiecePos: false, turn: !turn});
        return;
      }
      else if (retBoard.draw) {
        this.setState({draw: true, legalMoves: [], lastSelectedPiecePos: false, turn: !turn});
        return;
      }
      else if (retBoard.board){
        this.setState({
          board: retBoard.board, 
          lastSelectedPiecePos: false, 
          turn: !turn, 
          legalMoves: [], 
          kingPos: retBoard.kingPos, 
          inCheck: retBoard.inCheck, 
          checkmate: retBoard.checkmate, 
          castleCheck: retBoard.castleCheck, 
          lastEnPassant: retBoard.lastEnPassant
        });
      } 
      return;
    }
    // If piece is selected or switch to another piece
    const selectedPiece = board[r][c];
    if (!selectedPiece instanceof Piece || selectedPiece.type !== turn) return;
    const kIdx = selectedPiece.type? 0 : 1;
    const cIdx = selectedPiece.type? 0 : 1;
    // Show legal moves when piece is selected
    const lMoves = selectedPiece.allowedMoves(board, selectedPiecePos, selectedPiece, kingPos[kIdx], castleCheck[cIdx], lastEnPassant);
    this.setState({lastSelectedPiecePos: selectedPiecePos, legalMoves: lMoves});
  }
  // Resets chessboard state
  resetBoard(){
    this.setState({
      board: setupBoard(), 
      selectedPiece: false, 
      turn: WHITE, 
      legalMoves: [], 
      kingPos: [[0, 4], [7, 4]], 
      inCheck: false, 
      checkmate: false,
      winner: false,
      castleCheck: [[true, true, true], [true, true, true]],
      lastEnPassant: false, 
      draw: false
    });
    Game = new ChessGame();
  }
  render(){
    const {board, lastSelectedPiecePos, turn, legalMoves, inCheck, checkmate, draw, winner} = this.state;
    let winMessage = <div>{winner? "White Wins!!!" : "Black Wins!!!"}</div>
    let chessBoard = [];
    let cOdd = true;
    let rOdd = true;
    // Iterated through rows backwards so that white would be at row 0 similar to chess notation
    for(let r = 7; r >= 0; r--){
      let row = [] 
      cOdd = rOdd;
      for(let c = 0; c < this.props.nCols; c++){
        const sqr = `${String.fromCharCode(97 + c)}${r + 1}`;
        const isDark = cOdd? true: false;
        const piece = board[r][c];
        const pos = [r, c];
        const isSelected = arrayEquals(pos, lastSelectedPiecePos);
        const isLegalMove = legalMoves.some(lm => arrayEquals(lm, pos)? true : false);
        const isDraw = draw && piece instanceof King && (turn === piece.type);
        const kingInCheck = piece instanceof King && inCheck && (turn === piece.type);
        row.push(<Square key={sqr} isDark={isDark} piece={piece} selectPiece={() => this.selectPiece([r,c])} isSelected={isSelected} isLegal={isLegalMove} inCheck={kingInCheck} isCheckmate={checkmate} draw={isDraw}/>)
        cOdd = !cOdd;
      }
      chessBoard.push(<tr key={r + 1}>{row}</tr>)   
      rOdd = !rOdd;  
    }
    // Render Chess Pieces
    return (
      <div className="Board">
        <table className="Table">
          <tbody>
            {chessBoard}
          </tbody>
        </table>
        <button onClick={this.resetBoard}className="Reset">Reset</button>
      </div>
    );
  }
}

export default Board;