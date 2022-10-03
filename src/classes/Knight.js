const Piece = require("./Piece");
class Knight extends Piece {
  constructor(){
    super();
  }
  yeet() {
    console.log("Yeet");
  }
}

module.exports = Knight;