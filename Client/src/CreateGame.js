import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import "./CreateGame.css";

class CreateGame extends Component {
  constructor(props) {
    super(props);
    this.state = {username: "", setUsername: false}
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(evt) {
    this.setState({username: evt.target.value});
  }
  handleSubmit(evt) {
    evt.preventDefault();
    if (this.state.username.length) this.setState({setUsername: true});
  }
  render() {
    const { username, setUsername } = this.state;

    return (
      <>
        {
          setUsername? 
            <Navigate to="/game"/>
          : 
          <div className='CreateGame'>
            <form onSubmit={this.handleSubmit}>
              <label>Enter Your Username:</label>
              <input value={username} onChange={this.handleChange}></input>
              <button className="Submit">Submit</button>
            </form>
          </div>
        }
      </>
    );
  }
}

export default CreateGame;