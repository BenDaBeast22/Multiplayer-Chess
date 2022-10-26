import React, { Component } from 'react';
import { useParams } from 'react-router-dom';
import { Howl, Howler } from 'howler';
import "./Chat.css";
const socket = require("./connections/socket").socket;

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {message: "", chat: []};
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  componentDidMount() {
    console.log("Component mount");
    socket.on('ChatMessage', msg => {

      console.log("Chat message receieved");
      this.setState((st) => ({
        chat: [...st.chat, msg]
      }));
      this.playSound("/soundEffects/notify.mp3");
    });
  }
  playSound(src) {
    const sound = new Howl({src, volume: 0.2});
    sound.play();
  }
  handleMessageChange(evt) {
    this.setState({message: evt.target.value})
  }
  handleSubmit(evt) {
    evt.preventDefault();
    const { params, username } = this.props;
    const { message } = this.state;
    const gameId = params.gameId;
    const chatMessage = {gameRoomId: gameId, msg: message, username}
    if (message) {
      socket.emit("SendMessage", chatMessage);
      this.setState({message: ""});
    }
  }
  render() {
    let { message, chat } = this.state;
    console.log(chat);
    const chatMessages = chat.map((msg, i) => {
      const isOppMsg = this.props.username !== msg.username;
      const chatClasses = "Chat-Message" + (isOppMsg? " Opponent-Chat-Message" : "");
      console.log(chatClasses)
      return <li key={i} className={chatClasses}><span className='Chat-username'><strong>{msg.username}</strong></span> {msg.msg}</li>
    });
    return (
      <div className="Chat">
        <div className="Chat-Message-Container">
          <h3 className="Chat-Title">Chat Room</h3>
          <ol className="Chat-Message-Box">
            {chatMessages}
          </ol>
        </div>
        <div className="Input-Container">
          <form onSubmit={this.handleSubmit} className='inputMessage'>
            <input name="message" maxLength="60" value={message} placeholder='type message here...' onChange={this.handleMessageChange}/>
            <button>Submit</button>
          </form>
        </div>
      </div> 
    );
  }
}

export default (props) => (
  <Chat {...props} params={useParams()}/>
);