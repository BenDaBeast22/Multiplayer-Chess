import { arrayEquals } from './Helpers';
import { King, Piece } from './Pieces';

const BLACK = false;
const WHITE = true;

class ChessGame {
  constructor(){
    this.turn = WHITE;
    this.kingPos = [[0, 4], [7, 4]];
  }
  isLegalMove(legalMoves, endPos){
    // Check that move is legal
    for(let move of legalMoves){
      if(arrayEquals(move, endPos)){
        return true;
      }
    }
  }
  isKingAttacked(kingPos, oppSqrsCovered) {

  }
  opposingSquaresCovered(board, turn) {
    let squaresCovered = [];
    // console.log(board);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] instanceof Piece) {
          const piece = board[r][c];
          if (turn !== piece.type) {
            piece.legalMoves(board, [r, c], piece).forEach(m => squaresCovered.push(m));
          }
        }
      }
    }
    return squaresCovered;

  }
  move(board, startPos, endPos, piece) {
    // If legal move
    const [a, b] = startPos;
    const [x, y] = endPos;
    console.log(startPos);
    console.log(endPos);
    const legalMoves = piece.legalMoves(board, startPos, piece);
    console.log(board);
    if(this.isLegalMove(legalMoves, endPos)){
      let newBoard = [...board];
      newBoard[a][b] = "-";
      newBoard[x][y] = piece;
      // Check move doesn't allow king to be attacked
      const kIdx = piece.type? 0 : 1;
      const sqrsCovered = this.opposingSquaresCovered(newBoard, piece.type);
      for (let move of sqrsCovered) {
        if (arrayEquals(move, this.kingPos[kIdx])) {
          console.log("iahsdfklhasdlkjfhlaksdjhflkasdhf")
          console.log(board);
          return false;
        }
      }
      if (piece instanceof King) {
        this.kingPos[kIdx] = endPos;
      }
      board[a][b] = "-";
      board[x][y] = piece;
      return board;
    }
    return false;
  }
}

export default ChessGame;