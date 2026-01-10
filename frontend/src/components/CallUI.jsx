import React, { useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { io } from "socket.io-client";


const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:your-turn-server.com", username: "user", credential: "password" },
  ],
};

const CallUI = () => {
  const { authUser } = useAuthStore();
  const { selectedUser } = useChatStore();
  const [callState, setCallState] = useState("idle"); // idle | calling | incoming | in-call
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const peerConnectionRef = useRef(null);
  const socket = useAuthStore.getState().socket;

  // Start a call
  const startCall = async () => {
    console.log("Starting call...");
    setCallState("calling");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("Local stream obtained:", stream);
      setLocalStream(stream);
      peerConnectionRef.current = new RTCPeerConnection(iceServers);
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track);
        peerConnectionRef.current.addTrack(track, stream);
      });

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate:", event.candidate);
          socket.emit("call:signal", { to: selectedUser._id, data: { type: "ice-candidate", candidate: event.candidate } });
        }
      };
      peerConnectionRef.current.ontrack = (event) => {
        console.log("Remote stream received:", event.streams[0]);
        setRemoteStream(event.streams[0]);
      };

      const offer = await peerConnectionRef.current.createOffer();
      console.log("Offer created:", offer);
      await peerConnectionRef.current.setLocalDescription(offer);
      socket.emit("call:user", { to: selectedUser._id, from: authUser._id });
      socket.emit("call:signal", { to: selectedUser._id, data: { type: "offer", sdp: offer } });
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  // Listen for incoming call
  React.useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = async () => {
      setCallState("incoming");
    };

    const handleSignal = async ({ from, data }) => {
      console.log("Signal received:", data);
      if (!peerConnectionRef.current && data.type === "offer") {
        console.log("Handling offer...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("Local stream obtained for incoming call:", stream);
        setLocalStream(stream);
        peerConnectionRef.current = new RTCPeerConnection(iceServers);
        stream.getTracks().forEach((track) => {
          console.log("Adding track to peer connection:", track);
          peerConnectionRef.current.addTrack(track, stream);
        });
        peerConnectionRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            socket.emit("call:signal", { to: from, data: { type: "ice-candidate", candidate: event.candidate } });
          }
        };
        peerConnectionRef.current.ontrack = (event) => {
          console.log("Remote stream received:", event.streams[0]);
          setRemoteStream(event.streams[0]);
        };
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await peerConnectionRef.current.createAnswer();
        console.log("Answer created:", answer);
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit("call:signal", { to: from, data: { type: "answer", sdp: answer } });
        setCallState("in-call");
      } else if (data.type === "answer") {
        console.log("Handling answer...");
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setCallState("in-call");
      } else if (data.type === "ice-candidate") {
        console.log("Adding ICE candidate:", data.candidate);
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    };

    const handleCallEnded = () => {
      setCallState("idle");
      setRemoteStream(null);
      setLocalStream(null);
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:signal", handleSignal);
    socket.on("call:ended", handleCallEnded);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:signal", handleSignal);
      socket.off("call:ended", handleCallEnded);
    };
  }, [socket]);

  // Accept or reject call
  const acceptCall = async () => {
    setCallState("in-call");
    // The rest handled in handleSignal
  };
  const endCall = () => {
    socket.emit("call:end", { to: selectedUser._id });
    setCallState("idle");
    setRemoteStream(null);
    setLocalStream(null);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  // UI
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {callState === "idle" && (
        <button className="btn btn-primary" onClick={startCall} disabled={!selectedUser}>
          Start Call
        </button>
      )}
      {callState === "calling" && <div>Calling...</div>}
      {callState === "incoming" && (
        <div>
          <div>Incoming call...</div>
          <button className="btn btn-success mr-2" onClick={acceptCall}>Accept</button>
          <button className="btn btn-error" onClick={endCall}>Reject</button>
        </div>
      )}
      {callState === "in-call" && (
        <div className="flex flex-col items-center">
          <div className="flex gap-2">
            <video autoPlay playsInline ref={video => { if (video && localStream) video.srcObject = localStream; }} muted className="w-32 h-32 bg-black" />
            <video autoPlay playsInline ref={video => { if (video && remoteStream) video.srcObject = remoteStream; }} className="w-32 h-32 bg-black" />
          </div>
          <button className="btn btn-error mt-2" onClick={endCall}>End Call</button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
