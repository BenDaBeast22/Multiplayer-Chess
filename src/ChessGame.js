import { arrayEquals } from './Helpers';
import { King, Rook, Pawn, Piece } from './Pieces';

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
    // Check every move you can to see if opponent can get out of check 
    const kingOppStartPos = kingOppPos;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const oppStartPos = board[r][c];
        if (oppStartPos instanceof Piece && oppStartPos.type !== piece.type) {
          let lMoves;
          // Need to check allowed moves for king since piece that king cannot take could be putting him in check
          if (oppStartPos instanceof King) lMoves = oppStartPos.allowedMoves(board, [r, c], board[r][c], kingOppPos);
          else lMoves = oppStartPos.legalMoves(board, [r, c], board[r][c]);
          // console.log("Piece lmoves");
          // console.log(`r = ${r}, c = ${c}`);
          // console.log(oppStartPos.imgName);
          // console.log(lMoves);
          for (let move of lMoves) {
            const [x, y] = move;
            let originalPos = board[r][c];
            let moveSquare = board[x][y]; 
            board[r][c] = "-";
            board[x][y] = oppStartPos;
            if (oppStartPos instanceof King) kingOppPos = [x, y];
            const squaresCovered = this.squaresCovered(board, piece.type);
            // if (board[r][c].img === "b_k") {
            //   console.log("squaresCovered");
            //   console.log(squaresCovered)
            //   console.log("kingPos");
            //   console.log(kingOppPos);
            // }
            if (!squaresCovered.some(s => arrayEquals(s, kingOppPos))) {
              board[r][c] = originalPos;
              board[x][y] = moveSquare;
              // console.log("squaresCovered");
              // console.log(squaresCovered);
              // console.log("kingOppPos");
              // console.log(kingOppPos);
              if (oppStartPos instanceof King) kingOppPos = kingOppStartPos;
              return false;
            }
            board[x][y] = moveSquare;
            board[r][c] = originalPos;
          }
        }
      }
    }
    return true;
  }
  kingUnderAttack(board, startPos, endPos, piece, kingPos) {
    if (piece instanceof King) kingPos = endPos;
    const [a, b] = startPos;
    const [x, y] = endPos;
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
  draw (board, piece, kingOppPos, castleCheck, lastEnPassant) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const oppPiece = board[r][c];
        const cIdx = piece.type? 0 : 1;
        if (oppPiece instanceof Piece && oppPiece.type !== piece.type) {
          const lMoves = oppPiece.allowedMoves(board, [r, c], oppPiece, kingOppPos, castleCheck[cIdx], lastEnPassant);
          if (lMoves.length > 0) {
            console.log("Lmoves");
            console.log(lMoves);
            return false;
          }
        }
      }
    }
    return true;
  }
  move(board, startPos, endPos, piece, kingPos, putInCheck, castleCheck, lastEnPassant, draw) {
    const [a, b] = startPos;
    let [x, y] = endPos;
    let inCheck = false;
    let checkmate = false;
    let enPassantSet = false;
    const kIdx = piece.type? 0 : 1;
    const kOppIdx = kIdx? 0: 1;
    const cIdx = piece.type? 0 : 1;
    const legalMoves = piece.allowedMoves(board, startPos, piece, kingPos[kIdx], castleCheck[cIdx], lastEnPassant);
    if (this.isLegalMove(legalMoves, endPos)) {
      // If moving piece is king adjust kingPos and castle rights set to false
      if (piece instanceof King) {
        const kColDiff = y - b;
        const rIdx = piece.type? 0: 7;
        // Right Castles
        if (!putInCheck && kColDiff === 2) {
          kingPos[kIdx] = endPos;
          board[rIdx][5] = board[rIdx][7];
          board[rIdx][7] = "-";
        }
        // Left Castles
        else if(!putInCheck && kColDiff === -2 || kColDiff === -3) {
          kingPos[kIdx] = [rIdx, 2];
          y = 2;
          board[rIdx][3] = board[rIdx][0];
          board[rIdx][0] = "-";
        } else {
          kingPos[kIdx] = endPos;
          castleCheck[cIdx][1] = false;
        }
      }
      else if (piece instanceof Rook) {
        if (a === 0) castleCheck[cIdx][0] = false;
        else if (a === 7) castleCheck[cIdx][2] = false;
      }
      else if (piece instanceof Pawn) {
        // Check if possible enPassant (Pawn moved up 2)
        if ((a == 1 && x == 3) || (a == 6 && x == 4)) {
          const backOne = piece.type? -1 : 1;
          lastEnPassant = [x + backOne, y];
          enPassantSet = true;
        }
        if (arrayEquals(endPos, lastEnPassant)){
          const er = piece.type? x - 1 : x + 1;
          board[er][y] = "-";
        }
      }
      if (!enPassantSet) lastEnPassant = false;
      board[a][b] = "-";
      board[x][y] = piece;
      // Sets check in state if put opponent in check
      const inCheck = this.checkedOpponent(board, piece.type, kingPos[kOppIdx]);
      if (inCheck && this.isCheckmate(board, startPos, piece, kingPos[kOppIdx])) {
        return [false, kingPos, true, true, false, lastEnPassant, draw];
      }
      const[kr, kc] = kingPos[kOppIdx];
      const oppKing = board[kr][kc];
      console.log(oppKing.allowedMoves(board, [kr, kc], oppKing, kingPos[kOppIdx], castleCheck[cIdx]));
      if (oppKing.allowedMoves(board, [kr, kc], oppKing, kingPos[kOppIdx], castleCheck[cIdx]).length === 0) {
        console.log("Draw Check")
        if (this.draw(board, piece, kingPos[kOppIdx], castleCheck, lastEnPassant)) {
          draw = true;
          return [false, kingPos, inCheck, checkmate, castleCheck, lastEnPassant, draw]
        }
      }
      return [board, kingPos, inCheck, checkmate, castleCheck, lastEnPassant, draw];
    }
    return [false, kingPos, inCheck, checkmate, castleCheck, lastEnPassant, draw];
  }
}

export default ChessGame;