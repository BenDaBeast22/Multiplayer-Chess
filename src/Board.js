import './Board.css'
import React from 'react'
import Square from './Square';
import {Piece, Pawn, Bishop, Knight, Rook, Queen, King} from './Pieces';
import { arrayEquals } from './Helpers';
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
      board: this.setupBoard(),
      selectedPiece: false,
      turn: WHITE,
      legalMoves: []
    }
    this.resetBoard = this.resetBoard.bind(this);
  }

  selectPiece(pos) {
    const [r, c] = pos;
    if (this.state.selectedPiece) {
      if (arrayEquals(pos, this.state.selectedPiece)){
        this.setState({selectedPiece: false, legalMoves: []})
        return;
      } 
      const [or, oc] = this.state.selectedPiece;
      const newBoard = Game.move(this.state.board, this.state.selectedPiece, pos, this.state.board[or][oc]);

      if (newBoard){
        this.setState({board: newBoard, selectedPiece: false, turn: !this.state.turn, legalMoves: []});
      } 
      return;
    }
    const selectedPiece = this.state.board[r][c];
    this.state.legalMoves = selectedPiece.legalMoves(this.state.board, pos, selectedPiece);
    if(selectedPiece instanceof Piece && selectedPiece.type === this.state.turn){
      this.setState({selectedPiece: pos});
    }
  }

  setupBoard() {
    let board = [];
    const {nRows, nCols} = this.props;
    // Generate Empty Board
    for (let r = nRows - 1; r >= 0; r--) {
      let row = []
      for (let c = 0; c < nCols; c++) {
        row.push("-") 
      }
      board.push(row)
    }
    // Display White Pieces
    board[0][0] = new Rook(WHITE, "w_r", [0, 0]);
    board[0][1] = new Knight(WHITE, "w_kn", [0, 1]);
    board[0][2] = new Bishop(WHITE, "w_b", [0, 2]);
    board[0][3] = new Queen(WHITE, "w_q", [0, 3]);
    board[0][4] = new King(WHITE, "w_k", [0, 4]);
    board[0][5] = new Bishop(WHITE, "w_b", [0, 5]);
    board[0][6] = new Knight(WHITE, "w_kn", [0, 6]);
    board[0][7] = new Rook(WHITE, "w_r", [0, 7]);
    // Display Black Pieces
    board[7][0] = new Rook(BLACK, "b_r", [7, 0]);
    board[7][1] = new Knight(BLACK, "b_kn", [7, 1]);
    board[7][2] = new Bishop(BLACK, "b_b", [7, 2]);
    board[7][3] = new Queen(BLACK, "b_q", [7, 3]);
    board[7][4] = new King(BLACK, "b_k", [7, 4]);
    board[7][5] = new Bishop(BLACK, "b_b", [7, 5]);
    board[7][6] = new Knight(BLACK, "b_kn", [7, 6]);
    board[7][7] = new Rook(BLACK, "b_r", [7, 7]);
    // Display Pawns
    for(let c = 0; c < 8; c++){
      board[1][c] = new Pawn(WHITE, "w_p", [1, c]);
      board[6][c] = new Pawn(BLACK, "b_p", [6, c]);
    }
    return board;
  }

  resetBoard(){
    this.setState({board: this.setupBoard(), selectedPiece: false, turn: WHITE})
    Game = new ChessGame();
  }
  render(){
    // Render Chess Board
    let board = [];
    let cOdd = true;
    let rOdd = true;
    for(let i = this.props.nRows - 1; i >= 0; i--){
      let row = [] 
      cOdd = rOdd
      for(let j = 0; j < this.props.nCols; j++){
        const sqr = `${String.fromCharCode(97 + j)}${i}`
        const isDark = cOdd? true: false;
        const piece = this.state.board[i][j];
        const pos = [i, j];
        const isSelected = arrayEquals(pos, this.state.selectedPiece);
        const isLegalMove = this.state.legalMoves.some(lm => arrayEquals(lm, pos)? true : false);
        row.push(<Square key={sqr} isDark={isDark} piece={piece} selectPiece={() => this.selectPiece([i,j])} isSelected={isSelected} isLegal={isLegalMove}/>)
        cOdd = !cOdd;
      }
      board.push(<tr key={i}>{row}</tr>)   
      rOdd = !rOdd;
      
      // Render Chess Pieces
    }
    return (
      <div className="Board">
        <table className="Table">
          <tbody>
            {board}
          </tbody>
        </table>
        <button onClick={this.resetBoard}className="Reset">Reset</button>
      </div>
    );
  }
}

export default Board;