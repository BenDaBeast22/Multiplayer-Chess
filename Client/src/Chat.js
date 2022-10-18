import React, { Component } from 'react';
import "./Chat.css";

class Chat extends Component {
  render() {
    return (
      <div className="Chat">
        <h3 className="Chat-title">Chat</h3>
        <ol className="Chat-Message-Box">
          <li className="Chat-Message">Hello There!</li>
          <li className="Chat-Message">Nice to meet you!</li>
        </ol>
      </div>
    );
  }
}

export default Chat;