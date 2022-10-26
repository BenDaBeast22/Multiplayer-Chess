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
  isCheckmate(board, piece, kingOppPos){
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
          for (let move of lMoves) {
            const [x, y] = move;
            let originalPos = board[r][c];
            let moveSquare = board[x][y]; 
            board[r][c] = "-";
            board[x][y] = oppStartPos;
            if (oppStartPos instanceof King) kingOppPos = [x, y];
            const squaresCovered = this.squaresCovered(board, piece.type);
            if (!squaresCovered.some(s => arrayEquals(s, kingOppPos))) {
              board[r][c] = originalPos;
              board[x][y] = moveSquare;
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
  // Update kingPos and move rook onto the correct square
  // completeCastle(board, piece, startPos, endPos, kingPos, kIdx, putInCheck) {
  //   const startCol = startPos[1];
  //   const endCol = endPos[1];
  //   const kColDiff = endCol - startCol;
  //   const rIdx = piece.type? 0: 7;
  //   // Right Castles
  //   if (!putInCheck && kColDiff === 2) {
  //     board[rIdx][5] = board[rIdx][7];
  //     board[rIdx][7] = "-";
  //   }
  //   // Left Castles
  //   else if(!putInCheck && (kColDiff === -2 || kColDiff === -3)) {
  //     board[rIdx][3] = board[rIdx][0];
  //     board[rIdx][0] = "-";
  //   } 
  //   // Move King without castling
  //   else {
  //     kingPos[kIdx] = endPos;
  //     castleCheck[cIdx][1] = false;
  //   }
  // }
  draw (board, piece, kingOppPos, castleCheck, lastEnPassant) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const oppPiece = board[r][c];
        const cIdx = piece.type? 0 : 1;
        if (oppPiece instanceof Piece && oppPiece.type !== piece.type) {
          const lMoves = oppPiece.allowedMoves(board, [r, c], oppPiece, kingOppPos, castleCheck[cIdx], lastEnPassant);
          if (lMoves.length > 0) {
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
    let capture = false;
    const kIdx = piece.type? 0 : 1;
    const kOppIdx = kIdx? 0: 1;
    const cIdx = piece.type? 0 : 1;
    // return [board, kingPos, inCheck, checkmate, castleCheck, lastEnPassant, draw]
    const retBoard = {
      board: board,
      lastSelectedPiecePos: false,
      kingPos: kingPos,
      inCheck: inCheck,
      checkmate: checkmate,
      castleCheck: castleCheck,
      lastEnPassant: lastEnPassant,
      draw: draw,
      capture: capture
    }
    const legalMoves = piece.allowedMoves(board, startPos, piece, kingPos[kIdx], castleCheck[cIdx], retBoard.lastEnPassant);
    if (this.isLegalMove(legalMoves, endPos)) {
      retBoard.capture = board[x][y] instanceof Piece; 
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
        else if(!putInCheck && (kColDiff === -2 || kColDiff === -3)) {
          kingPos[kIdx] = [rIdx, 2];
          y = 2;
          board[rIdx][3] = board[rIdx][0];
          board[rIdx][0] = "-";
        } 
        // Move King without castling
        else {
          kingPos[kIdx] = endPos;
          castleCheck[cIdx][1] = false;
        }
      }
      else if (piece instanceof Rook) {
        if (b === 0) castleCheck[cIdx][0] = false;
        else if (b === 7) castleCheck[cIdx][2] = false;
      }
      else if (piece instanceof Pawn) {
        // Set the lastEnPassant 
        if ((a === 1 && x === 3) || (a === 6 && x === 4)) {
          const backOne = piece.type? -1 : 1;
          retBoard.lastEnPassant = [x + backOne, y];
          enPassantSet = true;
        }
        // If lastEnPassant move occurs do it
        if (arrayEquals(endPos, retBoard.lastEnPassant)){
          const er = piece.type? x - 1 : x + 1;
          board[er][y] = "-";
        }
        // If pawn reaches end of board promote pawn and trigger piece selector
        if (x === 7 || x === 0) {
          retBoard.promotePawn = endPos;
          retBoard.lastSelectedPiecePos = startPos;
          console.log(retBoard.promotePawn);
        } 
      }
      // If rook is captured can't castle on that side
      if (board[x][y] instanceof Rook) {
        if (y === 0) castleCheck[cIdx][0] = false;
        else if (y === 7) castleCheck[cIdx][2] = false;
      }
      if (!enPassantSet) retBoard.lastEnPassant = false;
      board[a][b] = "-";
      board[x][y] = piece;
      // Sets check in state if put opponent in check
      const inCheck = this.checkedOpponent(board, piece.type, kingPos[kOppIdx]);
      // Returns checkmate if opponent in check and can't get out of check
      if (inCheck && this.isCheckmate(board, piece, kingPos[kOppIdx])) {
        retBoard.inCheck = true;
        retBoard.checkmate = true;
        return retBoard;
      }
      const[kr, kc] = kingPos[kOppIdx];
      const oppKing = board[kr][kc];
      // Returns draw if other player has no moves they can make
      if (oppKing.allowedMoves(board, [kr, kc], oppKing, kingPos[kOppIdx], castleCheck[cIdx]).length === 0) {
        if (this.draw(board, piece, kingPos[kOppIdx], castleCheck, lastEnPassant)) {
          retBoard.draw = true;
          return retBoard;
        }
      }
      retBoard.inCheck = inCheck;
      // retBoard.kingPos = kingPos;
      // retBoard.lastEnPassant = lastEnPassant;
      return retBoard;
    }
    retBoard.board = false;
    return retBoard;
  }
}

export default ChessGame;