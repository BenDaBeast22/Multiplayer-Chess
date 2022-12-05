import { arrayEquals } from './ChessHelpers';
const BLACK = false;
const WHITE = true;

// Abstract Class
class Piece {
  constructor(type, img){
    if(this.constructor === Piece){
      throw new Error('Class "Piece" cannot be instantiated');
    }
    this.type = type;
    this.imgName = img;
  }
  // True if row and column are on the board (8x8)
  onBoard(r, c){
    if(r > 7 || r < 0 || c > 7 || c < 0){
      return false;
    }
    return true;
  }
  isPiece(piece) {
    if (piece instanceof Piece) return true;
    return false;
  }
  // True if piece on the square is the same color as the piece you are moving
  sameColor(sqr, piece){
    if(sqr instanceof Piece && sqr.type === piece.type){
      return true;
    }
    return false;
  }
  isOppositePiece(sqr, piece) {
    if (sqr.type !== piece.type) return true;
    return false;
  }
  emptySquare(sqr) {
    return !(sqr instanceof Piece);
  }
  straightLegalMoves(board, startPos, piece, off) {
    const lMoves = [];
    const [rStart, cStart] = startPos;
    for (let r = rStart + off; this.onBoard(r, cStart); r += off) {
      if (this.isPiece(board[r][cStart])) {
        if (this.isOppositePiece(board[r][cStart], piece)) {
          lMoves.push([r, cStart]);
        }
        break;
      }
      lMoves.push([r, cStart]);
    }
    return lMoves;
  }
  horizantalLegalMoves(board, startPos, piece, off) {
    const lMoves = [];
    const [rStart, cStart] = startPos;
    for (let c = cStart + off; this.onBoard(rStart, c); c += off) {
      if (this.isPiece(board[rStart][c])) {
        if (this.isOppositePiece(board[rStart][c], piece)) {
          lMoves.push([rStart, c]);
        }
        break;
      }
      lMoves.push([rStart, c]);
    }
    return lMoves;
  }
  diagonalLegalMoves(board, startPos, piece, rOff, cOff) {
    const lMoves = [];
    const [rStart, cStart] = startPos;
    let r = rStart + rOff;
    let c = cStart + cOff;
    while (this.onBoard(r, c)) {
      if (this.isPiece(board[r][c])) {
        if (this.isOppositePiece(board[r][c], piece)) {
          lMoves.push([r, c]);
        }
        break;
      }
      lMoves.push([r, c]);
      r += rOff;
      c += cOff;
    }
    return lMoves;
  }
  arrayLegalMoves(board, startPos, piece, moves) {
    let lMoves = [];
    const [rStart, cStart] = startPos;
    for(let move of moves){
      const [rOff, cOff] = move;
      let r = rStart + rOff;
      let c = cStart + cOff;
      // If move sqr is on the board and does not have one of your pieces on it move is valid
      if(this.onBoard(r, c) && !this.sameColor(board[r][c], piece)){
        lMoves.push([r, c]);
      }  
    }
    return lMoves;  
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
  enPassant(sqr, lastEnPassant) {
    return arrayEquals(sqr, lastEnPassant);
  } 
}

class Pawn extends Piece {
  constructor(type, img){
    super(type, img);
  }
  legalMoves(board, pawnPos, pawn, lastEnPassant) {
    let lMoves = [];
    const [rStart, cStart] = pawnPos;
    let upOne = [];
    let upOneRight = [];
    let upOneLeft = [];
    let ecOff;
    if (pawn.type === WHITE) {
      ecOff = 1;
      upOne = [rStart + 1, cStart];
      // Add up two legal move
      if(rStart === 1 && this.emptySquare(board[rStart + 2][cStart])) {
        lMoves.push([rStart + 2, cStart]);
      }
      upOneRight = [rStart + 1, cStart + 1];
      upOneLeft = [rStart + 1, cStart - 1];
    } 
    else {
      ecOff = -1;
      upOne = [rStart - 1, cStart];
      // Add up two legal move
      if(rStart === 6 && this.emptySquare(board[rStart - 2][cStart])) {
        lMoves.push([rStart - 2, cStart]);
      }
      upOneRight = [rStart - 1, cStart + 1];
      upOneLeft = [rStart - 1, cStart - 1];
    }
    // Add up one legal move
    const [uor, uoc] = upOne;
    if (this.onBoard(uor, uoc) && this.emptySquare(board[uor][uoc])) lMoves.push(upOne);
    // Add diagonal legal moves
    const diagonal = [upOneRight, upOneLeft];
    for (let move of diagonal) {
      const [rd, rc] = move;
      if (this.onBoard(rd, rc) && this.isPiece(board[rd][rc]) && this.isOppositePiece(board[rd][rc], pawn)) {
        lMoves.push([rd, rc])
      }
      if (this.enPassant([rd, rc], lastEnPassant)) {
        lMoves.push([rd, rc]);
      }
    }
    return lMoves;
  }
  allowedMoves(board, pawnPos, pawn, kingPos, castleCheck, lastEnPassant) {
    const lMoves = this.legalMoves(board, pawnPos, pawn, lastEnPassant);
    const aMoves = lMoves.filter(m => !this.kingUnderAttack(board, pawnPos, m, pawn, kingPos));
    return aMoves;
  }
}

class Bishop extends Piece {
  constructor(type, img){
    super(type, img);
  }
  legalMoves(board, bishopPos, bishop) {
    let lMoves = [];
    this.diagonalLegalMoves(board, bishopPos, bishop, 1, 1).forEach(m => lMoves.push(m)); // Up right
    this.diagonalLegalMoves(board, bishopPos, bishop, 1, -1).forEach(m => lMoves.push(m)); // Up left
    this.diagonalLegalMoves(board, bishopPos, bishop, -1, 1).forEach(m => lMoves.push(m)); // Down right
    this.diagonalLegalMoves(board, bishopPos, bishop, -1, -1).forEach(m => lMoves.push(m)); // Down left
    return lMoves;
  }
  allowedMoves(board, bishopPos, bishop, kingPos) {
    const lMoves = this.legalMoves(board, bishopPos, bishop);
    const aMoves = lMoves.filter(m => !this.kingUnderAttack(board, bishopPos, m, bishop, kingPos));
    return aMoves;
  }
}

class Rook extends Piece {
  constructor(type, img){
    super(type, img);
  }
  legalMoves(board, rookPos, rook) {
    let lMoves = [];
    this.straightLegalMoves(board, rookPos, rook, 1).forEach(m => lMoves.push(m)); // Up
    this.straightLegalMoves(board, rookPos, rook, -1).forEach(m => lMoves.push(m)); // Down
    this.horizantalLegalMoves(board, rookPos, rook, 1).forEach(m => lMoves.push(m)); // Right
    this.horizantalLegalMoves(board, rookPos, rook, -1).forEach(m => lMoves.push(m)); // Left
    return lMoves;
  }
  allowedMoves(board, rookPos, rook, kingPos) {
    const lMoves = this.legalMoves(board, rookPos, rook);
    const aMoves = lMoves.filter(m => !this.kingUnderAttack(board, rookPos, m, rook, kingPos));
    return aMoves;
  }
}

class Queen extends Piece {
  constructor(type, img){
    super(type, img);
  }
  legalMoves(board, queenPos, queen) {
    let lMoves = [];
    this.straightLegalMoves(board, queenPos, queen, 1).forEach(m => lMoves.push(m)); // Up
    this.straightLegalMoves(board, queenPos, queen, -1).forEach(m => lMoves.push(m)); // Down
    this.horizantalLegalMoves(board, queenPos, queen, 1).forEach(m => lMoves.push(m)); // Right
    this.horizantalLegalMoves(board, queenPos, queen, -1).forEach(m => lMoves.push(m)); // Left
    this.diagonalLegalMoves(board, queenPos, queen, 1, 1).forEach(m => lMoves.push(m)); // Up right
    this.diagonalLegalMoves(board, queenPos, queen, 1, -1).forEach(m => lMoves.push(m)); // Up left
    this.diagonalLegalMoves(board, queenPos, queen, -1, 1).forEach(m => lMoves.push(m)); // Down right
    this.diagonalLegalMoves(board, queenPos, queen, -1, -1).forEach(m => lMoves.push(m)); // Down left
    return lMoves;
  }
  allowedMoves(board, queenPos, queen, kingPos) {
    const lMoves = this.legalMoves(board, queenPos, queen);
    const aMoves = lMoves.filter(m => !this.kingUnderAttack(board, queenPos, m, queen, kingPos));
    return aMoves;
  }
}

class Knight extends Piece {
  constructor(type, img){
    super(type, img);
  }
  legalMoves(board, knightPos, knight) {
    let lMoves = [];
    const [rStart, cStart] = knightPos;
    const moves = [[1,2], [-1,2], [1,-2], [-1,-2], [2,1], [-2,1], [2,-1], [-2,-1]];
    for(let move of moves){
      const [rOff, cOff] = move;
      let r = rStart + rOff;
      let c = cStart + cOff;
      // If move sqr is on the board and does not have one of your pieces on it move is valid
      if(this.onBoard(r, c) && !this.sameColor(board[r][c], knight)){
        const lMove = [r, c];
        lMoves.push(lMove);
      }  
    }
    return lMoves;  
  }
  allowedMoves(board, knightPos, knight, kingPos) {
    const lMoves = this.legalMoves(board, knightPos, knight);
    const aMoves = lMoves.filter(m => !this.kingUnderAttack(board, knightPos, m, knight, kingPos));
    return aMoves;
  }
}

class King extends Piece {
  constructor(type, img){
    super(type, img);
  }
  castleMoves(board, kingPos, castleCheck, king) {
    const cMoves = [];
    const [r, c] = kingPos;
    if (castleCheck[1] && castleCheck[2]) {
      let rightCastle = true;
      for (let i = 1; i <= 2; i++) {
        if (!this.emptySquare(board[r][c + i]) || this.kingUnderAttack(board, kingPos, [r, c + i], king)) {
          rightCastle = false;
        }
      }
      if (rightCastle) cMoves.push([r, c + 2]); 
    }
    if (castleCheck[1] && castleCheck[0]) {
      let leftCastle = true;
      for (let i = 1; i <= 2; i++) {
        if (!this.emptySquare(board[r][c - i]) || this.kingUnderAttack(board, kingPos, [r, c - i], king)) {
          leftCastle = false;
        }
      }
      if (!this.emptySquare(board[r][c - 3])) leftCastle = false;
      if (leftCastle) cMoves.push([r, c - 2], [r, c - 3]);
    }
    return cMoves;
  }
  legalMoves(board, kingPos, king) {
    let lMoves = [];
    const moves = [
      [1, -1], [1, 0], [1, 1],
      [0, -1],         [0, 1],
      [-1,-1], [-1,0], [-1,1]
    ];
    this.arrayLegalMoves(board, kingPos, king, moves).forEach(m => lMoves.push(m));
    return lMoves;
  }
  allowedMoves(board, piecePos, king, kingPos, castleCheck) {
    let lMoves = this.legalMoves(board, piecePos, king);
    if (castleCheck) this.castleMoves(board, piecePos, castleCheck, king).forEach(m => {
      if (m)
      lMoves.push(m)
    });
    const aMoves = lMoves.filter(m => !this.kingUnderAttack(board, piecePos, m, king));
    return aMoves;
  }
}


export {Piece, Pawn, Bishop, Knight, Rook, Queen, King};
