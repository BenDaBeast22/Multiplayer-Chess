import './Square.css';
import React from 'react';
// Chess piece images: https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces

class Square extends React.Component {
  constructor(props){
    super(props);
    this.state = {dragOver: false}
    this.handleClick = this.handleClick.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
  }
  handleClick() {
    if (this.props.isCheckmate || this.props.draw) {
      return;
    }
    this.props.selectPiece();
  }
  handleDragStart(e) {
    console.log('dragStart', this.props.pos);
    e.dataTransfer.setData("pos", this.props.pos);
    e.dataTransfer.effectAllowed = "move";
    console.log(e.dataTransfer);
    this.props.selectPiece();
    // e.transfer.setData("pos", this.props.pos);
  }
  handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    this.setState({dragOver: true})
  }
  handleDragLeave(e) {
    this.setState({dragOver: false});
  }
  handleDrop(e) {
    e.preventDefault();
    const selectedPiece = e.dataTransfer.getData("pos");
    const movedSqr = this.props.pos;
    console.log("Pos: ", this.props.pos);
    this.props.dropMove(selectedPiece, movedSqr);
  }
  render(){
    const {piece, isLegal} = this.props;
    const {dragOver} = this.state;
    const classes = "square" + (this.props.isDark ? " dark" : " light") + (this.props.isSelected ? " selected": "" + (this.props.inCheck ? " inCheck": "") + (this.props.draw ? " draw" : ""));
    const dragClasses = (dragOver && isLegal) ? " hover" : "";
    return (
      <td onClick={this.handleClick} className={classes+dragClasses} onDragOver={this.handleDragOver} onDrop={this.handleDrop} onDragLeave={this.handleDragLeave}>
        {
          piece !== '-'? 
            <img className="piece" src={`./images/${piece.imgName}.png`} onDragStart={this.handleDragStart}/>
          : 
            <i className={`${isLegal && !dragOver? 'fa-solid fa-circle legal': ''}`}/>
        }
      </td>
    );
  }
}

export default Square;