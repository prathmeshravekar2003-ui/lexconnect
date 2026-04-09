import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { HiOutlineMicrophone, HiOutlineVideoCamera, HiOutlinePhoneMissedCall, HiOutlineSwitchHorizontal } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const VideoCall = () => {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  
  const [stream, setStream] = useState();
  const [partnerStream, setPartnerStream] = useState();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCalling, setIsCalling] = useState(true);
  
  const myVideo = useRef();
  const partnerVideo = useRef();
  const socketRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    const initCall = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;

        socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
          auth: { token }
        });

        socketRef.current.emit('join_room', consultationId);

        // This is a simplified WebRTC flow for demo
        // In a production app, use Agora or a more robust signaling flow
        socketRef.current.on('incoming_call', (data) => {
          if (data.from !== user.id) {
            acceptCall(data.signal, data.from);
          }
        });

        socketRef.current.on('call_accepted', (data) => {
          setIsCalling(false);
          peerRef.current.signal(data.signal);
        });

        socketRef.current.on('call_ended', () => {
          endCall();
        });

        // Start call if this is the initiator (let's assume first one in starts)
        // Just for demo, we'll try to call the "other" person
        // In real app, we fetch consultation to know the other user ID
      } catch (err) {
        toast.error('Could not access camera/microphone');
      }
    };

    initCall();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [consultationId]);

  const startCall = (receiverId) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      socketRef.current.emit('call_user', {
        receiverId,
        signal: data,
        consultationId,
        callType: 'video'
      });
    });

    peer.on('stream', (currentPartnerStream) => {
      setPartnerStream(currentPartnerStream);
      if (partnerVideo.current) partnerVideo.current.srcObject = currentPartnerStream;
    });

    peerRef.current = peer;
  };

  const acceptCall = (signal, callerId) => {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socketRef.current.emit('answer_call', {
        callerId,
        signal: data
      });
    });

    peer.on('stream', (currentPartnerStream) => {
      setPartnerStream(currentPartnerStream);
      if (partnerVideo.current) partnerVideo.current.srcObject = currentPartnerStream;
    });

    peer.signal(signal);
    peerRef.current = peer;
  };

  const toggleMute = () => {
    stream.getAudioTracks()[0].enabled = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    stream.getVideoTracks()[0].enabled = !isVideoOff;
    setIsVideoOff(!isVideoOff);
  };

  const endCall = () => {
    if (peerRef.current) peerRef.current.destroy();
    if (stream) stream.getTracks().forEach(track => track.stop());
    navigate(`/chat/${consultationId}`);
  };

  return (
    <div className="bg-slate-900 h-screen flex flex-col relative overflow-hidden">
      
      {/* Background Partner Video */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
        {partnerStream ? (
          <video playsInline ref={partnerVideo} autoPlay className="h-full w-full object-cover" />
        ) : (
          <div className="text-center animate-pulse">
            <div className="w-32 h-32 rounded-full bg-slate-700 mx-auto mb-6 flex items-center justify-center border-4 border-slate-600">
              <HiOutlineVideoCamera className="w-12 h-12 text-slate-500" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Waiting for partner...</p>
          </div>
        )}
      </div>

      {/* Floating My Video */}
      <div className="absolute top-8 right-8 w-48 md:w-64 h-36 md:h-48 rounded-3xl overflow-hidden border-4 border-white shadow-2xl z-10 bg-slate-700">
        <video playsInline muted ref={myVideo} autoPlay className="h-full w-full object-cover -scale-x-100" />
        {isVideoOff && (
          <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            <HiOutlineVideoCamera className="w-8 h-8 text-slate-600 line-through" />
          </div>
        )}
      </div>

      {/* Info Overlay */}
      <div className="absolute top-8 left-8 z-10 glass-dark px-6 py-3 rounded-2xl flex items-center gap-4 border border-white/10">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-white text-sm font-bold uppercase tracking-widest">Live Consultation</span>
        <div className="w-px h-4 bg-white/20"></div>
        <span className="text-slate-400 text-xs">Room: {consultationId.substring(0, 8)}...</span>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <ControlButton 
          onClick={toggleMute} 
          active={isMuted} 
          icon={<HiOutlineMicrophone className="w-6 h-6" />} 
          label={isMuted ? 'Unmute' : 'Mute'}
        />
        <ControlButton 
          onClick={endCall} 
          danger 
          icon={<HiOutlinePhoneMissedCall className="w-8 h-8" />} 
          label="End Call"
        />
        <ControlButton 
          onClick={toggleVideo} 
          active={isVideoOff} 
          icon={<HiOutlineVideoCamera className="w-6 h-6" />} 
          label={isVideoOff ? 'Vid On' : 'Vid Off'}
        />
      </div>

      {/* Switching camera logic (mobile) */}
      <button className="absolute top-8 right-8 mt-56 mr-2 z-10 md:hidden bg-white/10 p-3 rounded-full backdrop-blur-md">
        <HiOutlineSwitchHorizontal className="w-6 h-6 text-white" />
      </button>

    </div>
  );
};

const ControlButton = ({ onClick, active, danger, icon, label }) => (
  <div className="flex flex-col items-center gap-2">
    <button 
      onClick={onClick}
      className={`p-5 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${
        danger 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : active 
            ? 'bg-slate-700 text-white' 
            : 'bg-white text-slate-900'
      }`}
    >
      {icon}
    </button>
    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{label}</span>
  </div>
);

export default VideoCall;
