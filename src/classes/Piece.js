// Abstract Class
class Piece {
  constructor(pos){
    if(this.constructor === Piece){
      throw new Error('Class "Piece" cannot be instantiated');
    }
    this.pos = pos;
  }

  sayHello() {
    console.log('hello');
  }
}

module.exports = Piece;