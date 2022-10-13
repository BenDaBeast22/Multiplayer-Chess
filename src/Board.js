import './Board.css'
import React from 'react'
import Square from './Square';
import { Piece, King, Queen, Knight, Bishop, Rook } from './Pieces';
import { arrayEquals, setupBoard } from './Helpers';
import { Howl, Howler } from 'howler';
import ChessGame from './ChessGame';

const BLACK = false
const WHITE = true

const soundEffects = {
  whiteMove: "./whiteMove.wav",
  blackMove: "./blackMove.wav"
}

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
      draw: false, 
      promotePawn: false, 
      
    }
    this.resetBoard = this.resetBoard.bind(this);
    this.dropMove = this.dropMove.bind(this);
    this.selectPromote = this.selectPromote.bind(this);
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
  // Called when a player promotes a pawn and selects piece to promote to
  selectPromote(selectedPiecePos, newPiece) {
    const [pr, pc] = selectedPiecePos;
    const {kingPos, castleCheck, lastEnPassant, turn} = this.state;
    const kIdx = newPiece.type? 0 : 1;
    const kOppIdx = kIdx? 0: 1;
    const newBoard = this.state.board;
    newBoard[pr][pc] = newPiece;
    console.log("color", turn === WHITE? "White": "Black");

    // Check if opponent in check
    const inCheck = Game.checkedOpponent(newBoard, newPiece.type, kingPos[kOppIdx]);
    // Check for checkmate
    if (inCheck && Game.isCheckmate(newBoard, newPiece, kingPos[kOppIdx])) {
      console.log("CHEKMATE")
      this.setState({board: newBoard, winner: newPiece.type, checkmate: true, inCheck: true, legalMoves: [], lastSelectedPiecePos: false, promotePawn: false});
    }
    // Check for draw
    else if (Game.draw(newBoard, newPiece, kingPos[kOppIdx], castleCheck, lastEnPassant)) {
      this.setState({board: newBoard, draw: true, legalMoves: [], lastSelectedPiecePos: false, promotePawn: false});
    } 
    else {
      this.setState({
        board: newBoard, 
        lastSelectedPiecePos: false, 
        legalMoves: [], 
        inCheck: inCheck, 
        promotePawn: false
      });
    }
  }

  // Called when player clicks on a piece
  selectPiece(selectedPiecePos) {
    const [r, c] = selectedPiecePos;
    const {board, lastSelectedPiecePos, kingPos, inCheck, castleCheck, lastEnPassant, draw, turn, promotePawn} = this.state;

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
          lastEnPassant: retBoard.lastEnPassant,
          promotePawn: retBoard.promotePawn
        });
        if (turn === WHITE) {
          this.playSound("./soundEffects/whiteMove.wav");
        }
        else this.playSound("./soundEffects/blackMove.wav");
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
  dropMove(movedSqr) {
    this.selectPiece(movedSqr);
  }
  playSound(src) {
    const sound = new Howl({src});
    sound.play();
  }
  selectorSquares (pawnPromote) {
    let arr = [];
    const [r, c] = pawnPromote;
    const turn = (r === 7)? WHITE : BLACK;
    if (turn === WHITE) {
      arr.push(
        new Bishop(WHITE, "w_b"),
        new Rook(WHITE, "w_r"), 
        new Knight(WHITE, "w_kn"), 
        new Queen(WHITE, "w_q") 
      );
    } else {
      arr.push(
        new Queen(BLACK, "b_q"),
        new Knight(BLACK, "b_kn"),
        new Rook(BLACK, "b_r"),
        new Bishop(BLACK, "b_b")
      );
    }
    return arr;
  }
  selectorSquare (pawnPromote, selectSquares, pos){
    const [pr, pc] = pawnPromote;
    const [r, c] = pos;
    const turn = (pr === 7)? WHITE : BLACK;
    if (turn === WHITE) {
      if (c === pc && (r >= 4 && r < 8)) {
        console.log("pr = ",pr)
        return selectSquares[r - 4];
      }
    } else {
      if (c === pc && (r <= 3)) {
        return selectSquares[r];
      }
    }
  }
  // Resets chessboard state
  resetBoard(){
    this.setState({
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
      draw: false,
      promotePawn: false
    });
    Game = new ChessGame();
  }
  render(){
    const {board, lastSelectedPiecePos, turn, legalMoves, inCheck, checkmate, draw, winner, promotePawn} = this.state;
    let winMessage = <div>{winner? "White Wins!!!" : "Black Wins!!!"}</div>
    let chessBoard = [];
    let cOdd = true;
    let rOdd = true;
    let selectorSquares;
    let selectorSquare;
    let pr, pc;
    if (promotePawn) {
      selectorSquares = this.selectorSquares(promotePawn);
      console.log(selectorSquares);
    }
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
        selectorSquare = false;
        if (promotePawn) {
          [pr, pc] = promotePawn;
          selectorSquare = this.selectorSquare(promotePawn, selectorSquares, pos); 
          console.log(selectorSquare)
        }
        row.push(<Square key={sqr} pos={pos} isDark={isDark} piece={piece} selectPiece={() => this.selectPiece([r,c])} isSelected={isSelected} isLegal={isLegalMove} inCheck={kingInCheck} isCheckmate={checkmate} draw={isDraw} dropMove={this.dropMove} selectorSquare={selectorSquare} selectPromote={this.selectPromote} promotePos={promotePawn} turn={turn}/>)
        cOdd = !cOdd;
      }
      chessBoard.push(<tr className="Row" key={r + 1}>{row}</tr>)   
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
        <button onClick={this.resetBoard}className="newGame">New Game</button>
      </div>
    );
  }
}

export default Board;