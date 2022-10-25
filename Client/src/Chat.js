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
    const { params } = this.props;
    const { message } = this.state;
    const gameId = params.gameId;
    const chatMessage = {gameRoomId: gameId, msg: message}
    if (message) {
      socket.emit("SendMessage", chatMessage);
      this.setState({message: ""});
    }
  }
  render() {
    let { message, chat } = this.state;
    console.log(chat);
    const chatMessages = chat.map((msg, i) => (
      <li key={i} className='Chat-Message'>{msg}</li>
    ));
    return (
      <div className="Chat">
        <h3 className="Chat-title">Chat</h3>
        <ol className="Chat-Message-Box">
          {chatMessages}
        </ol>
        <form onSubmit={this.handleSubmit} className='inputMessage'>
          <input name="message" value={message} placeholder='type message here...' onChange={this.handleMessageChange}/>
          <button>Submit</button>
        </form>
      </div>
    );
  }
}

export default (props) => (
  <Chat {...props} params={useParams()}/>
);