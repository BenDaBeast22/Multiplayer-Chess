import { arrayEquals } from './Helpers';
import { King, Piece } from './Pieces';

const BLACK = false;
const WHITE = true;

class ChessGame {
  constructor(){
    this.turn = WHITE;
  }
  isLegalMove(legalMoves, endPos){
    // Check that move is legal
    for(let move of legalMoves){
      if(arrayEquals(move, endPos)){
        return true;
      }
    }
  }
  checkedOpponent(board, turn, oppKingPos) {
    const squaresCovered = this.squaresCovered(board, turn);
    for (let sqr of squaresCovered) {
      if (arrayEquals(sqr, oppKingPos)) {
        return true;
      }
    }
    return false;
  }
  squaresCovered(board, turn) {
    let squaresCovered = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] instanceof Piece) {
          const piece = board[r][c];
          if (turn === piece.type) {
            piece.legalMoves(board, [r, c], piece).forEach(m => squaresCovered.push(m));
          }
        }
      }
    }
    return squaresCovered;
  }
  isCheckmate(board, startPos, piece, kingOppPos){
    const [a, b] = startPos;
    const oppSquaresCovered = this.squaresCovered(board, !piece.type);
    const squaresCovered = this.squaresCovered(board, piece.type);
    // Check every move you can to see if opponent can get out of check
    for (let move of oppSquaresCovered) {
      const [x, y] = move;
      board[a][b] = "-";
      const moveSquare = board[x][y]; 
      board[x][y] = piece;
      // If you cant get out of check and every square is covered it's Checkmate!
      for (let square in squaresCovered) {
        if (arrayEquals(square, kingOppPos)) {
          return false;
        }
      }
      board[x][y] = moveSquare;
    }
    return true;
  }
  kingUnderAttack(board, startPos, endPos, piece, kingPos) {
    if (piece instanceof King) kingPos = endPos;
    const [a, b] = startPos;
    const [x, y] = endPos;
    // const newBoard = board.map(o => o);
    const endPiece = board[x][y];
    board[a][b] = "-";
    board[x][y] = piece;
    // Check move doesn't allow king to be attacked
    const sqrsCovered = this.opposingSquaresCovered(board, piece.type);
    for (let move of sqrsCovered) {
      if (arrayEquals(move, kingPos)) {
        board[x][y] = endPiece;
        board[a][b] = piece;
        return true;
      }
    }
    board[x][y] = endPiece;
    board[a][b] = piece;
    return false;
  } 
  move(board, startPos, endPos, piece, kingPos, putInCheck) {
    const [a, b] = startPos;
    const [x, y] = endPos;
    let inCheck = false;
    let checkmate = false;
    const kIdx = piece.type? 0 : 1;
    const kOppIdx = kIdx? 0: 1;
    const legalMoves = piece.allowedMoves(board, startPos, piece, kingPos[kIdx]);
    if (this.isLegalMove(legalMoves, endPos)) {
      if (piece instanceof King) {
        kingPos[kIdx] = endPos;
      }
      board[a][b] = "-";
      board[x][y] = piece;
      // Sets check in state if put opponent in check
      const inCheck = this.checkedOpponent(board, piece.type, kingPos[kOppIdx]);
      if (inCheck) {
        checkmate = this.isCheckmate(board, startPos, piece, kingPos[kOppIdx]);
        return [false, kingPos, true, true];
      }
      return [board, kingPos, inCheck, checkmate];
    }
    return [false, kingPos, inCheck, checkmate];
  }
}

export default ChessGame;