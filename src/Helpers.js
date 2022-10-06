import {Piece, Pawn, Bishop, Knight, Rook, Queen, King} from './Pieces';
const BLACK = false;
const WHITE = true;


function arrayEquals(a, b) {
  return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
}

// Sets up chessboard array with pieces
function setupBoard() {
  let board = [];
  // Generate Empty Board
  for (let r = 0; r < 8; r++) {
    let row = []
    for (let c = 0; c < 8; c++) {
      row.push("-") 
    }
    board.push(row)
  }
  // Display White Pieces
  board[0][0] = new Rook(WHITE, "w_r");
  board[0][1] = new Knight(WHITE, "w_kn");
  board[0][2] = new Bishop(WHITE, "w_b");
  board[0][3] = new Queen(WHITE, "w_q");
  board[0][4] = new King(WHITE, "w_k");
  board[0][5] = new Bishop(WHITE, "w_b");
  board[0][6] = new Knight(WHITE, "w_kn");
  board[0][7] = new Rook(WHITE, "w_r");
  // Display Black Pieces
  board[7][0] = new Rook(BLACK, "b_r");
  board[7][1] = new Knight(BLACK, "b_kn");
  board[7][2] = new Bishop(BLACK, "b_b");
  board[7][3] = new Queen(BLACK, "b_q");
  board[7][4] = new King(BLACK, "b_k");
  board[7][5] = new Bishop(BLACK, "b_b");
  board[7][6] = new Knight(BLACK, "b_kn");
  board[7][7] = new Rook(BLACK, "b_r");
  // Display Pawns
  for(let c = 0; c < 8; c++){
    board[1][c] = new Pawn(WHITE, "w_p", [1, c]);
    board[6][c] = new Pawn(BLACK, "b_p", [6, c]);
  }
  return board;
}
export {arrayEquals, setupBoard};