const BLACK = false;
const WHITE = true;

// Abstract Class
class Piece {
  constructor(type, img, pos){
    if(this.constructor === Piece){
      throw new Error('Class "Piece" cannot be instantiated');
    }
    this.type = type;
    this.imgName = img;
    this.pos = pos;
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
}

class Pawn extends Piece {
  constructor(type, img){
    super(type, img);
  }
  legalMoves(board, pawnPos, pawn) {
    let lMoves = [];
    const [rStart, cStart] = pawnPos;
    let upOne = [];
    let upOneRight = [];
    let upOneLeft = [];
    if (pawn.type === WHITE) {
      upOne = [rStart + 1, cStart];
      // Add up two legal move
      if(rStart === 1) {
        lMoves.push([rStart + 2, cStart]);
      }
      upOneRight = [rStart + 1, cStart + 1];
      upOneLeft = [rStart + 1, cStart - 1];
    } 
    else {
      upOne = [rStart - 1, cStart];
      // Add up two legal move
      if(rStart === 6) {
        lMoves.push([rStart - 2, cStart]);
      }
      upOneRight = [rStart - 1, cStart + 1];
      upOneLeft = [rStart - 1, cStart - 1];
    }
    // Add up one legal move
    const [uor, uoc] = upOne;
    if (this.emptySquare(board[uor][uoc])) lMoves.push(upOne);
    // Add diagonal legal moves
    const diagonal = [upOneRight, upOneLeft];
    for (let move of diagonal) {
      const [rd, rc] = move;
      if (this.isPiece(board[rd][rc]) && this.isOppositePiece(board[rd][rc], pawn)) {
        lMoves.push([rd, rc])
      }
    }
    return lMoves;
  }
}

class Bishop extends Piece {
  constructor(type, img){
    super(type, img);
  }
  legalMoves(board, bishopPos, bishop) {
    const lMoves = [];
    this.diagonalLegalMoves(board, bishopPos, bishop, 1, 1).forEach(m => lMoves.push(m)); // Up right
    this.diagonalLegalMoves(board, bishopPos, bishop, 1, -1).forEach(m => lMoves.push(m)); // Up left
    this.diagonalLegalMoves(board, bishopPos, bishop, -1, 1).forEach(m => lMoves.push(m)); // Down right
    this.diagonalLegalMoves(board, bishopPos, bishop, -1, -1).forEach(m => lMoves.push(m)); // Down left
    return lMoves;
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
}

class King extends Piece {
  constructor(type, img){
    super(type, img);
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
}


export {Piece, Pawn, Bishop, Knight, Rook, Queen, King};
