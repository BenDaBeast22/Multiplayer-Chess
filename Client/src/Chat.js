import React, { Component } from 'react';
import "./Chat.css";
const socket = require("./connections/socket").socket;

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {message: "", chat: []};
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleMessageChange(evt) {
    this.setState({message: evt.target.value})
  }
  handleSubmit(evt) {
    evt.preventDefault();
    const { message } = this.state;
    console.log(message);
    if (message) {
      socket.emit("chat message", message);
      this.setState({message: ""});
    }
  }
  render() {
    let { message, chat } = this.state;
    console.log(chat);
    socket.on('chat message', msg => {
      this.setState({chat: [...chat, msg]});
    });
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

export default Chat;