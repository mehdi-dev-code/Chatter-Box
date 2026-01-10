import React, { useRef, useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const iceServers = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    // Note: In production, replace this with a real TURN server
    { urls: "turn:your-turn-server.com", username: "user", credential: "password" },
  ],
};

const CallUI = () => {
  // Pulling authUser AND socket from useAuthStore now
  const { authUser, socket } = useAuthStore(); 
  const { selectedUser } = useChatStore();

  const [callState, setCallState] = useState("idle"); // idle | calling | incoming | in-call
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const peerConnectionRef = useRef(null);

  // Start a call
  const startCall = async () => {
    if (!socket || !selectedUser) return;

    try {
      setCallState("calling");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      peerConnectionRef.current = new RTCPeerConnection(iceServers);
      stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:signal", { 
            to: selectedUser._id, 
            data: { type: "ice-candidate", candidate: event.candidate } 
          });
        }
      };

      peerConnectionRef.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      socket.emit("call:user", { to: selectedUser._id, from: authUser._id });
      socket.emit("call:signal", { to: selectedUser._id, data: { type: "offer", sdp: offer } });
    } catch (error) {
      console.error("Error starting call:", error);
      setCallState("idle");
    }
  };

  // Listen for incoming call
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = () => setCallState("incoming");

    const handleSignal = async ({ from, data }) => {
      if (!peerConnectionRef.current && data.type === "offer") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(stream);
          peerConnectionRef.current = new RTCPeerConnection(iceServers);
          stream.getTracks().forEach((track) => peerConnectionRef.current.addTrack(track, stream));

          peerConnectionRef.current.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("call:signal", { to: from, data: { type: "ice-candidate", candidate: event.candidate } });
            }
          };
          peerConnectionRef.current.ontrack = (event) => setRemoteStream(event.streams[0]);

          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit("call:signal", { to: from, data: { type: "answer", sdp: answer } });
          setCallState("in-call");
        } catch (err) {
          console.error("Failed to answer call:", err);
        }
      } else if (data.type === "answer") {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        setCallState("in-call");
      } else if (data.type === "ice-candidate") {
        try {
          if (peerConnectionRef.current) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (err) {
          console.warn("Error adding ICE candidate:", err);
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

  const acceptCall = () => setCallState("in-call");

  const endCall = () => {
    if (socket && selectedUser) {
        socket.emit("call:end", { to: selectedUser._id });
    }
    setCallState("idle");
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    setRemoteStream(null);
    setLocalStream(null);
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      {callState === "idle" && (
        <button className="btn btn-primary btn-sm" onClick={startCall} disabled={!selectedUser}>
          Start Call
        </button>
      )}
      {callState === "calling" && <div className="animate-pulse text-blue-400">Calling...</div>}
      {callState === "incoming" && (
        <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 shadow-xl">
          <div className="mb-2 text-center">Incoming call...</div>
          <div className="flex gap-2">
            <button className="btn btn-success btn-sm" onClick={acceptCall}>Accept</button>
            <button className="btn btn-error btn-sm" onClick={endCall}>Reject</button>
          </div>
        </div>
      )}
      {callState === "in-call" && (
        <div className="flex flex-col items-center">
          <div className="flex gap-2">
            <div className="relative">
                <video autoPlay playsInline ref={v => v && localStream && (v.srcObject = localStream)} muted className="w-32 h-24 rounded-lg bg-black border border-slate-600 object-cover" />
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 rounded">You</span>
            </div>
            <div className="relative">
                <video autoPlay playsInline ref={v => v && remoteStream && (v.srcObject = remoteStream)} className="w-32 h-24 rounded-lg bg-black border border-slate-600 object-cover" />
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 rounded">{selectedUser?.fullName}</span>
            </div>
          </div>
          <button className="btn btn-error btn-sm mt-2 w-full" onClick={endCall}>End Call</button>
        </div>
      )}
    </div>
  );
};

export default CallUI;
