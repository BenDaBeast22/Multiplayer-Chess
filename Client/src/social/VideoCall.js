import React, { useEffect, useState, useRef } from 'react';
import Peer from "simple-peer";
import { Howl } from 'howler';
import "./VideoCall.css";
const socket = require("../connections/socket").socket;

const VideoCall = (props) => {
  const { username, opponentUsername } = props;
  const [stream, setStream] = useState();
  const [connectionError, setConnectionError] = useState(false);
  const [receivingCall, setReceivingCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const myVideo = useRef();
  const oppVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
      setStream(stream);
      myVideo.current.srcObject = stream;
    }).catch(() => {
      setConnectionError(true);
      console.log("Connection Error");
    });

    socket.on("callOpponent", signal => {
      console.log("Opponent Called");
      setReceivingCall(true);
      playSound("/soundEffects/videoCall.mp3");
      setCallerSignal(signal);
    });

    socket.on("resetCall", () => {
      setStream(false);
      setConnectionError(false);
      setReceivingCall(false);
      setCalling(false);
      setCallerSignal(null);
      setCallAccepted(false);
      setCallEnded(false);
    });
  }, [callEnded]);

  const callOpponent = () => {
    setCalling(true);
    console.log("calling opponent");
    const peer = new Peer({
      initiator: true,
      trickle: false, 
      stream: stream
    });
    peer.on("signal", signal => {
      socket.emit("callOpponent", signal);
    });
    peer.on("stream", stream => {
      if (oppVideo.current) {
        oppVideo.current.srcObject = stream;
      }
    });

    socket.on("callAccepted", signal => {
      setCalling(false);
      setCallAccepted(true);
      peer.signal(signal);
      connectionRef.current = peer;
      console.log("call accepted");
      playSound("/soundEffects/joinCall.mp3");
    });  
  }

  const answerCall = () => {
    console.log("called answered call");
    setCallAccepted(true); 
    const peer = new Peer({
      initiator: false, 
      trickle: false, 
      stream: stream
    });
    // Called when connection is made by initiator pier
    peer.on("signal", signal => {
      socket.emit("answerCall", signal);
    });

    peer.on("stream", stream => {
      if (oppVideo.current) {
        oppVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
    playSound("/soundEffects/join.mp3");
  }

  const rejectCall = () => socket.emit("endCall");

  const leaveCall = () => {
    setCallEnded(true);
    socket.emit("endCall");
    connectionRef.current.destroy();
  }

  const playSound = (src) => {
    const sound = new Howl({src, volume: 0.2});
    sound.play();
  }

  let faceCam = 
    <div className="My-Video">
      <video playsInline ref={myVideo} autoPlay />
    </div>

  let oppFaceCam = 
    <div className="Opp-Video">
      <video playsInline ref={oppVideo} autoPlay />   
    </div> 

  const callButtons = () => {
    let videoButton;
    if (receivingCall && !callAccepted) {
      videoButton = 
      <>
        <button className="answer" onClick={answerCall}>Answer</button>
        <button className="endCall" onClick={rejectCall}>Reject</button>
      </>
    } else if (calling && !callAccepted) {
      videoButton = <div className='calling'>Calling {opponentUsername}...</div>
    } else if (!callAccepted || callEnded) {
      videoButton = <button className="call" onClick={() => callOpponent()}>Call</button>
    } else if (callAccepted && !callEnded) {
      videoButton = <button className="endCall" onClick={leaveCall}>End Call</button>
    }
    return videoButton;
  }
  
  return (
    <div className='VideoCall'>
      {!connectionError && faceCam}
      {callAccepted && !callEnded && oppFaceCam} 
      <div className="Buttons">{callButtons()}</div>
    </div>
  );
};

export default VideoCall;