import './Board.css'
import React from 'react'
import Square from './Square';
import { Piece, King, Queen, Knight, Bishop, Rook, Pawn } from './Pieces';
import { arrayEquals, setupBoard } from './Helpers';
import { Howl } from 'howler';
import { useParams } from 'react-router-dom';
import ChessGame from './ChessGame';
const socket = require("./connections/socket").socket;

const BLACK = false
const WHITE = true

const soundEffects = {
  whiteMove: "./whiteMove.wav",
  blackMove: "./blackMove.wav"
}

let Game = new ChessGame();
console.log("Game Socket = ", socket);
console.log("Game Socket Id = ", socket.id);

class Board extends React.Component {
  static defaultProps = {
    nRows: 8,
    nCols: 8,
  }
  constructor(props) {
    super(props);
    // console.log("props = ", props);
    this.state = {
      board: setupBoard(),
      lastSelectedPiecePos: false,
      turn: WHITE,
      legalMoves: [],
      kingPos: [[0, 4], [7, 4]],
      inCheck: false,
      checkmate: false,
      winner: undefined,
      castleCheck: [[true, true, true], [true, true, true]],
      lastEnPassant: false,
      draw: false, 
      promotePawn: false,
      resign: false,
      disconnect: false,
      moveNumber: 0
    }
    this.dropMove = this.dropMove.bind(this);
    this.selectPromote = this.selectPromote.bind(this);
    this.handleUpdateGameState = this.handleUpdateGameState.bind(this);
  }
  componentDidMount() {
    socket.on("opponent move", opponentMove => {
      const { board } = this.state;
      const { moveInfo, state } = opponentMove;
      const { checkmate, draw } = state;
      const newBoard = board;
      if (moveInfo["promotePos"]) {
        const {promotePos, promotePiece} = moveInfo;
        const [pr, pc] = promotePos;
        board[pr][pc] = promotePiece;
      } else {
        const {lastSelectedPiecePos, selectedPiecePos} = moveInfo;
        const [r, c] = lastSelectedPiecePos;
        const [x, y] = selectedPiecePos;
        const piece = board[r][c];
        // Castling logic
        const rIdx = piece.type? 0: 7;
        const kColDiff = y - c;
        if (piece instanceof King) {
          // Right Castles
          if (kColDiff === 2) {
            board[rIdx][5] = board[rIdx][7];
            board[rIdx][7] = "-";
          }
          // Left Castles
          else if(kColDiff === -2 || kColDiff === -3) {
            board[rIdx][3] = board[rIdx][0];
            board[rIdx][0] = "-";
            y = 2;
          } 
        }
        newBoard[x][y] = board[r][c];
        newBoard[r][c] = "-";
      }
      state.board = newBoard;
      state.winner = !state.winner;
      this.setState(state, () => {
        if (checkmate || draw) {
          this.handleUpdateGameState();
        }
      });
    });
    socket.on("player resigned", resign => {
      if (this.state.checkmate || this.state.draw) return;
      const {resignColor, disconnect} = resign;
      const { color } = this.props;
      console.log(`${color} resigned`);
      const resignState = {
        winner: color === resignColor? !color : color, 
        resign: true,
        checkmate: true, 
        inCheck: true, 
        legalMoves: [], 
        lastSelectedPiecePos: false,
        turn: color === resignColor? color : !color,
        disconnect: disconnect
      }
      this.setState(resignState, () => this.handleUpdateGameState());
      this.playSound("/soundEffects/lose.mp3");
    });
    socket.on("reset game", () => {
      console.log("Reset Game");
      Game = new ChessGame();
      this.setState({
        board: setupBoard(), 
        lastSelectedPiecePos: false, 
        turn: WHITE, 
        legalMoves: [], 
        kingPos: [[0, 4], [7, 4]], 
        inCheck: false, 
        checkmate: false,
        winner: undefined,
        castleCheck: [[true, true, true], [true, true, true]],
        lastEnPassant: false, 
        draw: false,
        promotePawn: false,
        resign: false,
        moveNumber: 0
      });
      this.playSound("/soundEffects/win.mp3");
    });
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
      this.setState({board: newBoard, winner: newPiece.type, checkmate: true, inCheck: true, legalMoves: [], lastSelectedPiecePos: false, promotePawn: false}, () => this.handleUpdateGameState());
    }
    // Check for draw
    else if (Game.draw(newBoard, newPiece, kingPos[kOppIdx], castleCheck, lastEnPassant)) {
      this.setState({board: newBoard, draw: true, legalMoves: [], lastSelectedPiecePos: false, promotePawn: false}, () => this.handleUpdateGameState());
    } 
    else {
      const promoteState = {
        board: newBoard, 
        lastSelectedPiecePos: false, 
        legalMoves: [], 
        inCheck: inCheck, 
        promotePawn: false  
      }
      this.setState(promoteState);
      // Send pawn promotion to oppononet
      const move = {
        promotePos: selectedPiecePos,
        promotePiece: newPiece
      };
      socket.emit("new move", {state: promoteState, moveInfo: move, gameRoomId: this.props.params.gameId});
    }
  }

  // Called when player clicks on a piece
  selectPiece(selectedPiecePos) {
    const [r, c] = selectedPiecePos;
    const {board, lastSelectedPiecePos, kingPos, inCheck, castleCheck, lastEnPassant, draw, turn, promotePawn, moveNumber} = this.state;

    // If a move is made
    if (lastSelectedPiecePos && !this.changeSelection(board, lastSelectedPiecePos, selectedPiecePos)) {
      if (arrayEquals(selectedPiecePos, lastSelectedPiecePos)){
        this.setState({lastSelectedPiecePos: false, legalMoves: []})
        return;
      } 
      const [or, oc] = lastSelectedPiecePos;
      const lastSelectedPiece = board[or][oc];
      const retBoard = Game.move(board, lastSelectedPiecePos, selectedPiecePos, lastSelectedPiece, kingPos, inCheck, castleCheck, lastEnPassant, draw);
      const move = {
        lastSelectedPiecePos,
        selectedPiecePos
      }
      if (retBoard.checkmate) {
        const checkmateState = {
          winner: lastSelectedPiece.type,
          checkmate: true, 
          inCheck: true,
          legalMoves: [],
          lastSelectedPiecePos: false, 
          turn: !turn
        }
        this.setState(checkmateState, () => this.handleUpdateGameState());
        this.playSound("/soundEffects/win.mp3");
        socket.emit("new move", {state: checkmateState, moveInfo: move, gameRoomId: this.props.params.gameId});
        return;
      }
      else if (retBoard.draw) {
        const drawState = {
          draw: true, 
          legalMoves: [], 
          lastSelectedPiecePos: false, 
          turn: !turn
        }
        this.setState(drawState, () => this.handleUpdateGameState());
        this.playSound("/soundEffects/draw.mp3");
        socket.emit("new move", {state: drawState, moveInfo: move, gameRoomId: this.props.params.gameId});
        return;
      }
      else if (retBoard.board){
        const moveState = {
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
        }
        this.setState(moveState);
        // socket.emit("move", board);
        if (retBoard.capture && retBoard.inCheck) {
          this.playSound("/soundEffects/capture.mp3");
          this.playSound("/soundEffects/check.mp3");
        }
        else if (retBoard.capture) {
          this.playSound("/soundEffects/capture.mp3");
        }
        else if (retBoard.inCheck) {
          this.playSound("/soundEffects/check.mp3");
        }
        else this.playSound("/soundEffects/move.mp3");
        // if (turn === WHITE) {
        //   this.playSound("/soundEffects/whiteMove.wav");
        // }
        // else this.playSound("/soundEffects/blackMove.wav");
        // Let opponent know that move was made
        socket.emit("new move", {state: moveState, moveInfo: move, gameRoomId: this.props.params.gameId});
        this.setState(st => ({
          moveNumber: st.moveNumber + 1
        }), 
        () => {
          if (this.state.moveNumber === 1) socket.emit("first move");
        });
      } else {
        this.playSound("/soundEffects/error.mp3");
      }
      return;
    }
    // If piece is selected or switch to another piece
    const selectedPiece = board[r][c];
    if (!selectedPiece instanceof Piece || selectedPiece.type !== turn || selectedPiece.type !== this.props.color) return;
    const kIdx = selectedPiece.type? 0 : 1;
    const cIdx = selectedPiece.type? 0 : 1;
    // Show legal moves when piece is selected
    const lMoves = selectedPiece.allowedMoves(board, selectedPiecePos, selectedPiece, kingPos[kIdx], castleCheck[cIdx], lastEnPassant);
    this.setState({lastSelectedPiecePos: selectedPiecePos, legalMoves: lMoves});
  }
  dropMove (movedSqr) {
    this.selectPiece(movedSqr);
  }
  playSound (src) {
    const sound = new Howl({src, volume: 0.2});
    sound.play();
  }
  playTwoSounds (src, secondSrc) {
    const secondSound = new Howl({src: secondSrc});
    const sound = new Howl({src, onend: () => secondSound.play()});
    sound.play()
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
        return selectSquares[r - 4];
      }
    } else {
      if (c === pc && (r <= 3)) {
        return selectSquares[r];
      }
    }
  }
  // Once game ends sends game state info to GameState component
  handleUpdateGameState() {
    const {checkmate, draw, resign, winner, disconnect} = this.state;
    const gameState = {
      checkmate,
      draw,
      resign,
      winner,
      disconnect
    }
    this.props.updateGameState(gameState);
  }
  render() {
    const {board, lastSelectedPiecePos, turn, legalMoves, inCheck, checkmate, draw, winner, promotePawn, resigned} = this.state;
    let winMessage = <div>{winner? "White Wins!!!" : "Black Wins!!!"}</div>
    let chessBoard = [];
    let cOdd = true;
    let rOdd = false;
    let selectorSquares;
    let selectorSquare;
    let pr, pc;
    if (promotePawn) {
      selectorSquares = this.selectorSquares(promotePawn);
      console.log(selectorSquares);
    }
    // Iterated through rows backwards so that white would be at row 0 similar to chess notation
    const color = this.props.color;
    let rp;
    let off;
    let lr;
    if (color === WHITE) {
      rp = 7;
      off = -1;
      lr  = 0;
    }
    else { //Color is BLACK
      rp = 0;
      off = 1;
      lr = 7;
      rOdd = true;
    }
    for(let r = rp;color? r >= lr : r <= lr; r += off){
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
        }
        row.push(<Square key={sqr} pos={pos} isDark={isDark} piece={piece} selectPiece={() => this.selectPiece([r,c])} isSelected={isSelected} isLegal={isLegalMove} inCheck={kingInCheck} isCheckmate={checkmate} draw={isDraw} dropMove={this.dropMove} selectorSquare={selectorSquare} selectPromote={this.selectPromote} promotePos={promotePawn} turn={turn}/>)
        cOdd = !cOdd;
      }
      chessBoard.push(<tr className="Row" key={r + 1}>{row}</tr>)   
      rOdd = !rOdd;
    }
    // Render Chess Pieces
    return (
      <div className="Board noselect">
        <table className="Table">
          <tbody>
            {chessBoard}
          </tbody>
        </table>
      </div>
    );
  }
}

export default (props) => (
  <Board {...props} params={useParams()}/>
);